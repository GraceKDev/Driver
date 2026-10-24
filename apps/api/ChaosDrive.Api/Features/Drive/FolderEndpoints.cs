using ChaosDrive.Api.Common;
using ChaosDrive.Api.Data;
using ChaosDrive.Api.Data.Entities;
using ChaosDrive.Api.Storage;
using Microsoft.EntityFrameworkCore;

namespace ChaosDrive.Api.Features.Drive;

public static class FolderEndpoints
{
    public static IEndpointRouteBuilder MapFolderEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/folders")
            .RequireAuthorization()
            .WithTags("Folders");

        group.MapPost("", CreateAsync).WithName("CreateFolder");
        group.MapPatch("/{id:guid}", RenameAsync).WithName("RenameFolder");
        group.MapDelete("/{id:guid}", TrashAsync).WithName("TrashFolder");
        group.MapPost("/{id:guid}/restore", RestoreAsync).WithName("RestoreFolder");
        group.MapDelete("/{id:guid}/permanent", PermanentDeleteAsync).WithName("PermanentlyDeleteFolder");

        return app;
    }

    private static async Task<IResult> CreateAsync(
        CreateFolderRequest? request,
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
        var validationError = DriveHelpers.ValidateFolderName(request.Name, out var name);
        if (validationError is not null)
        {
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["name"] = [validationError]
            });
        }

        if (request.ParentId.HasValue)
        {
            var parentExists = await db.Folders.AnyAsync(
                x => x.Id == request.ParentId.Value && x.OwnerId == ownerId && x.DeletedAt == null,
                cancellationToken);

            if (!parentExists)
            {
                return Results.NotFound();
            }
        }

        if (await DriveHelpers.NameExistsAsync(db, ownerId, request.ParentId, name, cancellationToken: cancellationToken))
        {
            return Results.Conflict(new
            {
                title = "Something with that name is already in this folder.",
                status = StatusCodes.Status409Conflict
            });
        }

        var now = DateTime.UtcNow;
        var folder = new Folder
        {
            Id = Guid.NewGuid(),
            OwnerId = ownerId,
            ParentId = request.ParentId,
            Name = name,
            CreatedAt = now,
            UpdatedAt = now
        };

        db.Folders.Add(folder);
        await db.SaveChangesAsync(cancellationToken);

        return Results.Created(
            $"/api/drive?folderId={folder.Id}",
            new FolderDto(folder.Id, folder.Name, folder.CreatedAt, folder.UpdatedAt));
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
        var folder = await db.Folders.FirstOrDefaultAsync(
            x => x.Id == id && x.OwnerId == ownerId && x.DeletedAt == null,
            cancellationToken);

        if (folder is null)
        {
            return Results.NotFound();
        }

        var validationError = DriveHelpers.ValidateFolderName(request.Name, out var name);
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
                folder.ParentId,
                name,
                excludeFolderId: folder.Id,
                cancellationToken: cancellationToken))
        {
            return Results.Conflict(new
            {
                title = "Something with that name is already in this folder.",
                status = StatusCodes.Status409Conflict
            });
        }

        folder.Name = name;
        folder.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return Results.Ok(new FolderDto(folder.Id, folder.Name, folder.CreatedAt, folder.UpdatedAt));
    }

    private static async Task<IResult> TrashAsync(
        Guid id,
        HttpContext http,
        AppDbContext db,
        CancellationToken cancellationToken)
    {
        var ownerId = http.User.GetUserId();

        var folders = await db.Folders
            .Where(x => x.OwnerId == ownerId && x.DeletedAt == null)
            .ToListAsync(cancellationToken);

        var root = folders.FirstOrDefault(x => x.Id == id);
        if (root is null)
        {
            return Results.NotFound();
        }

        var folderIds = DriveHelpers.CollectFolderIds(root.Id, folders);
        var now = DateTime.UtcNow;

        foreach (var folder in folders.Where(x => folderIds.Contains(x.Id)))
        {
            folder.DeletedAt = now;
            folder.TrashRootId = root.Id;
            folder.UpdatedAt = now;
        }

        var files = await db.Files
            .Where(x => x.OwnerId == ownerId
                        && x.DeletedAt == null
                        && x.FolderId != null
                        && folderIds.Contains(x.FolderId.Value))
            .ToListAsync(cancellationToken);

        foreach (var file in files)
        {
            file.DeletedAt = now;
            file.TrashRootId = root.Id;
            file.UpdatedAt = now;
        }

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

        var folders = await db.Folders
            .Where(x => x.OwnerId == ownerId && x.DeletedAt != null && x.TrashRootId == id)
            .ToListAsync(cancellationToken);

        var root = folders.FirstOrDefault(x => x.Id == id);
        if (root is null)
        {
            return Results.NotFound();
        }

        var files = await db.Files
            .Where(x => x.OwnerId == ownerId && x.DeletedAt != null && x.TrashRootId == id)
            .ToListAsync(cancellationToken);

        // Restoring must not push the desk over quota. Trashed files are excluded from
        // GetUsedBytesAsync, so this check adds back only what is about to become active.
        var restoreBytes = files
            .Where(x => x.Status == "ready")
            .Sum(x => x.SizeBytes);
        if (restoreBytes > 0)
        {
            var used = await DriveHelpers.GetUsedBytesAsync(db, ownerId, cancellationToken);
            if (used + restoreBytes > DriveHelpers.GetQuota(configuration))
            {
                return Results.Problem(
                    title: "There is not enough storage left in this desk.",
                    statusCode: StatusCodes.Status409Conflict);
            }
        }

        var destinationParentId = root.ParentId;
        if (destinationParentId.HasValue)
        {
            var parentIsAvailable = await db.Folders.AnyAsync(
                x => x.Id == destinationParentId.Value
                     && x.OwnerId == ownerId
                     && x.DeletedAt == null,
                cancellationToken);

            if (!parentIsAvailable)
            {
                destinationParentId = null;
            }
        }

        var restoredName = await DriveHelpers.UniqueNameAsync(
            db,
            ownerId,
            destinationParentId,
            root.Name,
            excludeFolderId: root.Id,
            cancellationToken: cancellationToken);

        root.ParentId = destinationParentId;
        root.Name = restoredName;

        var now = DateTime.UtcNow;
        foreach (var folder in folders)
        {
            folder.DeletedAt = null;
            folder.TrashRootId = null;
            folder.UpdatedAt = now;
        }

        foreach (var file in files)
        {
            file.DeletedAt = null;
            file.TrashRootId = null;
            file.UpdatedAt = now;
        }

        await db.SaveChangesAsync(cancellationToken);

        return Results.Ok(new FolderDto(root.Id, root.Name, root.CreatedAt, root.UpdatedAt));
    }

    private static async Task<IResult> PermanentDeleteAsync(
        Guid id,
        HttpContext http,
        AppDbContext db,
        IFileStorage storage,
        CancellationToken cancellationToken)
    {
        var ownerId = http.User.GetUserId();

        var folders = await db.Folders
            .Where(x => x.OwnerId == ownerId && x.DeletedAt != null && x.TrashRootId == id)
            .ToListAsync(cancellationToken);

        // Require the id to identify the trashed folder itself. Without this check a file id
        // passed to this route would match the file's own TrashRootId and delete the file.
        if (folders.All(x => x.Id != id))
        {
            return Results.NotFound();
        }

        var folderIds = folders.Select(x => x.Id).ToHashSet();

        var files = await db.Files
            .Where(x => x.OwnerId == ownerId
                        && ((x.FolderId != null && folderIds.Contains(x.FolderId.Value))
                            || (x.DeletedAt != null && x.TrashRootId == id)))
            .ToListAsync(cancellationToken);

        // Items trashed separately (their own TrashRootId) are not part of this purge. They
        // are detached so the folder rows can be removed without violating the RESTRICT FKs,
        // and they remain in the trash as standalone entries.
        var filesToDelete = files
            .Where(x => x.DeletedAt == null || x.TrashRootId == id)
            .ToList();
        var filesToDetach = files
            .Where(x => x.DeletedAt != null && x.TrashRootId != id)
            .ToList();

        // The same problem exists for folders that were trashed separately below a folder
        // that is now being purged. Detach them instead of deleting their trash entries.
        var foldersToDetach = await db.Folders
            .Where(x => x.OwnerId == ownerId
                        && x.ParentId != null
                        && folderIds.Contains(x.ParentId.Value)
                        && !folderIds.Contains(x.Id))
            .ToListAsync(cancellationToken);

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

        foreach (var file in filesToDelete)
        {
            await storage.DeleteAsync(file.S3Key, cancellationToken);
        }

        foreach (var file in filesToDetach)
        {
            file.FolderId = null;
        }

        foreach (var folder in foldersToDetach)
        {
            folder.ParentId = null;
        }

        // Break the self-referencing folder FK inside the set before deleting any rows.
        foreach (var folder in folders)
        {
            folder.ParentId = null;
        }

        await db.SaveChangesAsync(cancellationToken);

        db.Files.RemoveRange(filesToDelete);
        db.Folders.RemoveRange(folders);
        await db.SaveChangesAsync(cancellationToken);

        await transaction.CommitAsync(cancellationToken);

        return Results.NoContent();
    }
}
