using ChaosDrive.Api.Common;
using ChaosDrive.Api.Data;
using ChaosDrive.Api.Data.Entities;
using ChaosDrive.Api.Storage;
using Microsoft.EntityFrameworkCore;

namespace ChaosDrive.Api.Features.Drive;

public static class FileEndpoints
{
    public static IEndpointRouteBuilder MapFileEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/files")
            .RequireAuthorization()
            .WithTags("Files");

        group.MapPost("/uploads", CreateUploadAsync).WithName("CreateUpload");
        group.MapPost("/{id:guid}/complete", CompleteUploadAsync).WithName("CompleteUpload");
        group.MapGet("/{id:guid}/download", DownloadAsync).WithName("DownloadFile");
        group.MapPatch("/{id:guid}", RenameAsync).WithName("RenameFile");
        group.MapDelete("/{id:guid}", TrashAsync).WithName("TrashFile");
        group.MapPost("/{id:guid}/restore", RestoreAsync).WithName("RestoreFile");
        group.MapDelete("/{id:guid}/permanent", PermanentDeleteAsync).WithName("PermanentlyDeleteFile");

        return app;
    }

    private static async Task<IResult> CreateUploadAsync(
        CreateUploadRequest? request,
        HttpContext http,
        AppDbContext db,
        IFileStorage storage,
        IConfiguration configuration,
        ILoggerFactory loggerFactory,
        CancellationToken cancellationToken)
    {
        if (request is null)
        {
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["body"] = ["A request body is required."]
            });
        }

        var ownerId = http.User.GetUserId();
        var validationError = DriveHelpers.ValidateFileName(request.FileName, out var fileName);
        if (validationError is not null)
        {
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["fileName"] = [validationError]
            });
        }

        var maxFileBytes = DriveHelpers.GetMaxFileBytes(configuration);
        if (request.SizeBytes <= 0)
        {
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["sizeBytes"] = ["The file is empty."]
            });
        }

        if (request.SizeBytes > maxFileBytes)
        {
            return Results.Problem(
                title: $"Files must be {DriveHelpers.FormatFileSize(maxFileBytes)} or smaller.",
                statusCode: StatusCodes.Status413PayloadTooLarge);
        }

        if (request.FolderId.HasValue)
        {
            var folderExists = await db.Folders.AnyAsync(
                x => x.Id == request.FolderId.Value
                     && x.OwnerId == ownerId
                     && x.DeletedAt == null,
                cancellationToken);

            if (!folderExists)
            {
                return Results.NotFound();
            }
        }

        if (await DriveHelpers.NameExistsAsync(
                db,
                ownerId,
                request.FolderId,
                fileName,
                cancellationToken: cancellationToken))
        {
            // A failed upload leaves a pending row behind. Its ticket is only valid for
            // 15 minutes, so once it has expired the placeholder can be replaced; otherwise
            // an abandoned upload would block that name forever.
            var removedStaleTicket = await TryRemoveStalePendingUploadAsync(
                db,
                storage,
                loggerFactory.CreateLogger(typeof(FileEndpoints).FullName!),
                ownerId,
                request.FolderId,
                fileName,
                cancellationToken);

            if (!removedStaleTicket || await DriveHelpers.NameExistsAsync(
                    db,
                    ownerId,
                    request.FolderId,
                    fileName,
                    cancellationToken: cancellationToken))
            {
                return Results.Conflict(new
                {
                    title = "Something with that name is already in this folder.",
                    status = StatusCodes.Status409Conflict
                });
            }
        }

        var used = await DriveHelpers.GetUsedBytesAsync(db, ownerId, cancellationToken);
        var quota = DriveHelpers.GetQuota(configuration);
        if (used + request.SizeBytes > quota)
        {
            return Results.Problem(
                title: "There is not enough storage left in this desk.",
                statusCode: StatusCodes.Status409Conflict);
        }

        var contentType = string.IsNullOrWhiteSpace(request.ContentType)
            ? "application/octet-stream"
            : request.ContentType.Trim();

        if (contentType.Length > 255)
        {
            contentType = contentType[..255];
        }

        if (contentType.Any(char.IsControl))
        {
            contentType = "application/octet-stream";
        }

        var fileId = Guid.NewGuid();
        var s3Key = $"users/{ownerId}/{fileId}/{Naming.SanitizeKeySegment(fileName)}";
        var ticket = storage.CreateUploadUrl(s3Key, contentType);

        var now = DateTime.UtcNow;
        var file = new FileItem
        {
            Id = fileId,
            OwnerId = ownerId,
            FolderId = request.FolderId,
            Name = fileName,
            ContentType = contentType,
            DeclaredSizeBytes = request.SizeBytes,
            SizeBytes = 0,
            S3Key = s3Key,
            Status = "pending",
            CreatedAt = now,
            UpdatedAt = now
        };

        db.Files.Add(file);
        await db.SaveChangesAsync(cancellationToken);

        return Results.Created(
            $"/api/files/{fileId}",
            new UploadTicketDto(fileId, ticket.Url, ticket.ExpiresAt));
    }

    private static async Task<IResult> CompleteUploadAsync(
        Guid id,
        HttpContext http,
        AppDbContext db,
        IFileStorage storage,
        IConfiguration configuration,
        CancellationToken cancellationToken)
    {
        var ownerId = http.User.GetUserId();
        var file = await db.Files.FirstOrDefaultAsync(
            x => x.Id == id && x.OwnerId == ownerId && x.DeletedAt == null,
            cancellationToken);

        if (file is null)
        {
            return Results.NotFound();
        }

        if (file.Status == "ready")
        {
            return Results.Ok(ToDto(file));
        }

        var metadata = await storage.GetMetadataAsync(file.S3Key, cancellationToken);
        if (metadata is null)
        {
            return Results.Conflict(new
            {
                title = "The upload did not arrive in storage. Try again.",
                status = StatusCodes.Status409Conflict
            });
        }

        var maxFileBytes = DriveHelpers.GetMaxFileBytes(configuration);
        if (metadata.SizeBytes <= 0 || metadata.SizeBytes > maxFileBytes)
        {
            await storage.DeleteAsync(file.S3Key, cancellationToken);
            db.Files.Remove(file);
            await db.SaveChangesAsync(cancellationToken);

            return Results.Problem(
                title: $"Files must be between 1 byte and {DriveHelpers.FormatFileSize(maxFileBytes)}.",
                statusCode: StatusCodes.Status413PayloadTooLarge);
        }

        var used = await DriveHelpers.GetUsedBytesAsync(db, ownerId, cancellationToken);
        var quota = DriveHelpers.GetQuota(configuration);
        if (used + metadata.SizeBytes > quota)
        {
            await storage.DeleteAsync(file.S3Key, cancellationToken);
            db.Files.Remove(file);
            await db.SaveChangesAsync(cancellationToken);

            return Results.Problem(
                title: "There is not enough storage left in this desk.",
                statusCode: StatusCodes.Status409Conflict);
        }

        file.SizeBytes = metadata.SizeBytes;
        file.ContentType = string.IsNullOrWhiteSpace(metadata.ContentType)
            ? file.ContentType
            : metadata.ContentType;
        file.Status = "ready";
        file.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return Results.Ok(ToDto(file));
    }

    private static async Task<IResult> DownloadAsync(
        Guid id,
        HttpContext http,
        AppDbContext db,
        IFileStorage storage,
        CancellationToken cancellationToken)
    {
        var ownerId = http.User.GetUserId();
        var file = await db.Files.FirstOrDefaultAsync(
            x => x.Id == id
                 && x.OwnerId == ownerId
                 && x.DeletedAt == null
                 && x.Status == "ready",
            cancellationToken);

        if (file is null)
        {
            return Results.NotFound();
        }

        return Results.Ok(new
        {
            url = storage.CreateDownloadUrl(file.S3Key, file.Name)
        });
    }

    private static async Task<IResult> RenameAsync(
        Guid id,
        RenameRequest? request,
        HttpContext http,
        AppDbContext db,
        CancellationToken cancellationToken)
    {
        if (request is null)
        {
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["body"] = ["A request body is required."]
            });
        }

        var ownerId = http.User.GetUserId();
        var file = await db.Files.FirstOrDefaultAsync(
            x => x.Id == id
                 && x.OwnerId == ownerId
                 && x.DeletedAt == null
                 && x.Status == "ready",
            cancellationToken);

        if (file is null)
        {
            return Results.NotFound();
        }

        var validationError = DriveHelpers.ValidateFileName(request.Name, out var name);
        if (validationError is not null)
        {
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["name"] = [validationError]
            });
        }

        if (await DriveHelpers.NameExistsAsync(
                db,
                ownerId,
                file.FolderId,
                name,
                excludeFileId: file.Id,
                cancellationToken: cancellationToken))
        {
            return Results.Conflict(new
            {
                title = "Something with that name is already in this folder.",
                status = StatusCodes.Status409Conflict
            });
        }

        file.Name = name;
        file.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return Results.Ok(ToDto(file));
    }

    private static async Task<IResult> TrashAsync(
        Guid id,
        HttpContext http,
        AppDbContext db,
        CancellationToken cancellationToken)
    {
        var ownerId = http.User.GetUserId();
        var file = await db.Files.FirstOrDefaultAsync(
            x => x.Id == id && x.OwnerId == ownerId && x.DeletedAt == null,
            cancellationToken);

        if (file is null)
        {
            return Results.NotFound();
        }

        var now = DateTime.UtcNow;
        file.DeletedAt = now;
        file.TrashRootId = file.Id;
        file.UpdatedAt = now;
        await db.SaveChangesAsync(cancellationToken);

        return Results.NoContent();
    }

    private static async Task<IResult> RestoreAsync(
        Guid id,
        HttpContext http,
        AppDbContext db,
        IConfiguration configuration,
        CancellationToken cancellationToken)
    {
        var ownerId = http.User.GetUserId();
        var file = await db.Files.FirstOrDefaultAsync(
            x => x.Id == id
                 && x.OwnerId == ownerId
                 && x.DeletedAt != null
                 && x.TrashRootId == id,
            cancellationToken);

        if (file is null)
        {
            return Results.NotFound();
        }

        if (file.Status == "ready" && file.SizeBytes > 0)
        {
            var used = await DriveHelpers.GetUsedBytesAsync(db, ownerId, cancellationToken);
            if (used + file.SizeBytes > DriveHelpers.GetQuota(configuration))
            {
                return Results.Problem(
                    title: "There is not enough storage left in this desk.",
                    statusCode: StatusCodes.Status409Conflict);
            }
        }

        var destinationFolderId = file.FolderId;
        if (destinationFolderId.HasValue)
        {
            var folderIsAvailable = await db.Folders.AnyAsync(
                x => x.Id == destinationFolderId.Value
                     && x.OwnerId == ownerId
                     && x.DeletedAt == null,
                cancellationToken);

            if (!folderIsAvailable)
            {
                destinationFolderId = null;
            }
        }

        var restoredName = await DriveHelpers.UniqueNameAsync(
            db,
            ownerId,
            destinationFolderId,
            file.Name,
            excludeFileId: file.Id,
            cancellationToken: cancellationToken);

        file.FolderId = destinationFolderId;
        file.Name = restoredName;
        file.DeletedAt = null;
        file.TrashRootId = null;
        file.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return Results.Ok(ToDto(file));
    }

    private static async Task<IResult> PermanentDeleteAsync(
        Guid id,
        HttpContext http,
        AppDbContext db,
        IFileStorage storage,
        CancellationToken cancellationToken)
    {
        var ownerId = http.User.GetUserId();
        var file = await db.Files.FirstOrDefaultAsync(
            x => x.Id == id
                 && x.OwnerId == ownerId
                 && x.DeletedAt != null
                 && x.TrashRootId == id,
            cancellationToken);

        if (file is null)
        {
            return Results.NotFound();
        }

        await storage.DeleteAsync(file.S3Key, cancellationToken);
        db.Files.Remove(file);
        await db.SaveChangesAsync(cancellationToken);

        return Results.NoContent();
    }

    private static async Task<bool> TryRemoveStalePendingUploadAsync(
        AppDbContext db,
        IFileStorage storage,
        ILogger logger,
        Guid ownerId,
        Guid? folderId,
        string fileName,
        CancellationToken cancellationToken)
    {
        var cutoff = DateTime.UtcNow.AddMinutes(-15);
        var normalized = fileName.ToLowerInvariant();

        var stale = await db.Files.FirstOrDefaultAsync(
            x => x.OwnerId == ownerId
                 && x.FolderId == folderId
                 && x.DeletedAt == null
                 && x.Status != "ready"
                 && x.CreatedAt < cutoff
                 && x.Name.ToLower() == normalized,
            cancellationToken);

        if (stale is null)
        {
            return false;
        }

        db.Files.Remove(stale);
        await db.SaveChangesAsync(cancellationToken);

        try
        {
            await storage.DeleteAsync(stale.S3Key, cancellationToken);
        }
        catch (Exception exception)
        {
            // The database is already consistent; an orphaned object is preferable to
            // failing the replacement ticket.
            logger.LogWarning(exception, "Could not remove the orphaned upload object {S3Key}.", stale.S3Key);
        }

        return true;
    }

    private static FileDto ToDto(FileItem file)
        => new(file.Id, file.Name, file.ContentType, file.SizeBytes, file.CreatedAt, file.UpdatedAt);
}
