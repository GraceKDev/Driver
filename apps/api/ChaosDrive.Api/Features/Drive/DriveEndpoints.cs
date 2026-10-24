using ChaosDrive.Api.Common;
using ChaosDrive.Api.Data;
using ChaosDrive.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace ChaosDrive.Api.Features.Drive;

public static class DriveEndpoints
{
    public static IEndpointRouteBuilder MapDriveEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/drive")
            .RequireAuthorization()
            .WithTags("Drive");

        group.MapGet("", GetDriveAsync).WithName("GetDrive");
        group.MapGet("/trash", GetTrashAsync).WithName("GetTrash");
        group.MapGet("/search", SearchAsync).WithName("SearchDrive");

        return app;
    }

    private static async Task<IResult> GetDriveAsync(
        Guid? folderId,
        HttpContext http,
        AppDbContext db,
        IConfiguration configuration,
        CancellationToken cancellationToken)
    {
        var ownerId = http.User.GetUserId();

        if (folderId.HasValue)
        {
            var folderExists = await db.Folders.AnyAsync(
                x => x.Id == folderId.Value && x.OwnerId == ownerId && x.DeletedAt == null,
                cancellationToken);

            if (!folderExists)
            {
                return Results.NotFound();
            }
        }

        var folders = await db.Folders
            .Where(x => x.OwnerId == ownerId && x.ParentId == folderId && x.DeletedAt == null)
            .OrderBy(x => x.Name)
            .Select(x => new FolderDto(x.Id, x.Name, x.CreatedAt, x.UpdatedAt))
            .ToListAsync(cancellationToken);

        var files = await db.Files
            .Where(x => x.OwnerId == ownerId
                        && x.FolderId == folderId
                        && x.DeletedAt == null
                        && x.Status == "ready")
            .OrderBy(x => x.Name)
            .Select(x => new FileDto(x.Id, x.Name, x.ContentType, x.SizeBytes, x.CreatedAt, x.UpdatedAt))
            .ToListAsync(cancellationToken);

        var allFolders = await db.Folders
            .Where(x => x.OwnerId == ownerId && x.DeletedAt == null)
            .ToDictionaryAsync(x => x.Id, cancellationToken);

        var used = await DriveHelpers.GetUsedBytesAsync(db, ownerId, cancellationToken);

        return Results.Ok(new DriveResponse(
            folderId,
            DriveHelpers.BuildBreadcrumbs(folderId, allFolders),
            folders,
            files,
            DriveHelpers.GetStorage(used, configuration)));
    }

    private static async Task<IResult> GetTrashAsync(
        HttpContext http,
        AppDbContext db,
        IConfiguration configuration,
        CancellationToken cancellationToken)
    {
        var ownerId = http.User.GetUserId();

        var folders = await db.Folders
            .Where(x => x.OwnerId == ownerId
                        && x.DeletedAt != null
                        && x.TrashRootId == x.Id)
            .OrderByDescending(x => x.DeletedAt)
            .ToListAsync(cancellationToken);

        var files = await db.Files
            .Where(x => x.OwnerId == ownerId
                        && x.DeletedAt != null
                        && x.TrashRootId == x.Id)
            .OrderByDescending(x => x.DeletedAt)
            .ToListAsync(cancellationToken);

        var allFiles = await db.Files
            .Where(x => x.OwnerId == ownerId && x.DeletedAt != null)
            .ToListAsync(cancellationToken);

        var sizes = allFiles
            .Where(x => x.TrashRootId.HasValue)
            .GroupBy(x => x.TrashRootId!.Value)
            .ToDictionary(x => x.Key, x => x.Sum(file => file.SizeBytes));

        var allFolders = await db.Folders
            .Where(x => x.OwnerId == ownerId)
            .ToDictionaryAsync(x => x.Id, cancellationToken);

        var items = new List<TrashItemDto>();

        foreach (var folder in folders)
        {
            items.Add(new TrashItemDto(
                folder.Id,
                folder.Name,
                "folder",
                sizes.GetValueOrDefault(folder.Id),
                folder.DeletedAt!.Value,
                CombinePath(DriveHelpers.BuildPath(folder.ParentId, allFolders), folder.Name)));
        }

        foreach (var file in files)
        {
            items.Add(new TrashItemDto(
                file.Id,
                file.Name,
                "file",
                file.SizeBytes,
                file.DeletedAt!.Value,
                CombinePath(DriveHelpers.BuildPath(file.FolderId, allFolders), file.Name)));
        }

        var used = await DriveHelpers.GetUsedBytesAsync(db, ownerId, cancellationToken);

        return Results.Ok(new TrashResponse(
            items.OrderByDescending(x => x.DeletedAt).ToList(),
            DriveHelpers.GetStorage(used, configuration)));
    }

    private static async Task<IResult> SearchAsync(
        string? q,
        HttpContext http,
        AppDbContext db,
        CancellationToken cancellationToken)
    {
        var term = (q ?? string.Empty).Trim();
        if (term.Length < 1)
        {
            return Results.Ok(new SearchResponse([], []));
        }

        if (term.Length > 100)
        {
            term = term[..100];
        }

        var ownerId = http.User.GetUserId();
        var pattern = $"%{Naming.EscapeLike(term)}%";

        // EscapeLike() escapes %, _ and \ so the term is matched literally. Passing the
        // escape character explicitly is required: Npgsql otherwise emits ILIKE with no
        // ESCAPE clause (or an empty one), which makes names containing % or _ unmatchable.
        var matchedFolders = await db.Folders
            .Where(x => x.OwnerId == ownerId && x.DeletedAt == null)
            .Where(x => EF.Functions.ILike(x.Name.ToLower(), pattern, "\\"))
            .OrderBy(x => x.Name)
            .Take(10)
            .ToListAsync(cancellationToken);

        var matchedFiles = await db.Files
            .Where(x => x.OwnerId == ownerId
                        && x.DeletedAt == null
                        && x.Status == "ready")
            .Where(x => EF.Functions.ILike(x.Name.ToLower(), pattern, "\\"))
            .OrderBy(x => x.Name)
            .Take(10)
            .ToListAsync(cancellationToken);

        var allFolders = await db.Folders
            .Where(x => x.OwnerId == ownerId && x.DeletedAt == null)
            .ToDictionaryAsync(x => x.Id, cancellationToken);

        var folderResults = matchedFolders
            .Select(x => new SearchFolderDto(x.Id, x.Name, DriveHelpers.BuildPath(x.Id, allFolders)))
            .ToList();

        var fileResults = matchedFiles
            .Select(x => new SearchFileDto(
                x.Id,
                x.Name,
                x.ContentType,
                x.SizeBytes,
                x.FolderId,
                CombinePath(DriveHelpers.BuildPath(x.FolderId, allFolders), x.Name)))
            .ToList();

        return Results.Ok(new SearchResponse(folderResults, fileResults));
    }

    private static string CombinePath(string folderPath, string name)
        => folderPath == "/" ? $"/{name}" : $"{folderPath}/{name}";
}
