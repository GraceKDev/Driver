using ChaosDrive.Api.Data;
using ChaosDrive.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace ChaosDrive.Api.Features.Drive;

internal static class DriveHelpers
{
    public const long DefaultQuotaBytes = 5L * 1024 * 1024 * 1024;
    public const long DefaultMaxFileBytes = 100L * 1024 * 1024;
    public const int MaxNameLength = 255;

    public static long GetQuota(IConfiguration configuration)
        => configuration.GetValue<long?>("Storage:QuotaBytes") ?? DefaultQuotaBytes;

    public static long GetMaxFileBytes(IConfiguration configuration)
        => configuration.GetValue<long?>("Storage:MaxFileBytes") ?? DefaultMaxFileBytes;

    public static string FormatFileSize(long bytes)
    {
        if (bytes >= 1024 * 1024)
        {
            return FormattableString.Invariant($"{bytes / (1024.0 * 1024.0):0.##} MB");
        }

        return bytes >= 1024
            ? FormattableString.Invariant($"{bytes / 1024.0:0.##} KB")
            : $"{bytes} bytes";
    }

    public static async Task<long> GetUsedBytesAsync(
        AppDbContext db,
        Guid ownerId,
        CancellationToken cancellationToken)
    {
        return await db.Files
            .Where(x => x.OwnerId == ownerId && x.DeletedAt == null && x.Status == "ready")
            .SumAsync(x => (long?)x.SizeBytes, cancellationToken) ?? 0;
    }

    public static StorageDto GetStorage(long usedBytes, IConfiguration configuration)
        => new(usedBytes, GetQuota(configuration));

    public static List<Guid> CollectFolderIds(Guid rootId, IEnumerable<Folder> folders)
    {
        var childrenByParent = folders
            .Where(x => x.ParentId.HasValue)
            .GroupBy(x => x.ParentId!.Value)
            .ToDictionary(x => x.Key, x => x.Select(f => f.Id).ToList());

        var result = new List<Guid>();
        var visited = new HashSet<Guid>();
        var queue = new Queue<Guid>();
        queue.Enqueue(rootId);

        while (queue.Count > 0)
        {
            var current = queue.Dequeue();
            if (!visited.Add(current))
            {
                continue;
            }

            result.Add(current);
            if (childrenByParent.TryGetValue(current, out var children))
            {
                foreach (var child in children)
                {
                    queue.Enqueue(child);
                }
            }
        }

        return result;
    }

    public static List<BreadcrumbDto> BuildBreadcrumbs(
        Guid? folderId,
        IReadOnlyDictionary<Guid, Folder> folders)
    {
        var crumbs = new List<BreadcrumbDto>();
        var visited = new HashSet<Guid>();
        var current = folderId;

        while (current.HasValue
               && folders.TryGetValue(current.Value, out var folder)
               && visited.Add(folder.Id))
        {
            crumbs.Add(new BreadcrumbDto(folder.Id, folder.Name));
            current = folder.ParentId;
        }

        crumbs.Reverse();
        return crumbs;
    }

    public static string BuildPath(Guid? folderId, IReadOnlyDictionary<Guid, Folder> folders)
    {
        var crumbs = BuildBreadcrumbs(folderId, folders);
        return crumbs.Count == 0
            ? "/"
            : "/" + string.Join("/", crumbs.Select(x => x.Name));
    }

    public static async Task<bool> NameExistsAsync(
        AppDbContext db,
        Guid ownerId,
        Guid? folderId,
        string name,
        Guid? excludeFileId = null,
        Guid? excludeFolderId = null,
        CancellationToken cancellationToken = default)
    {
        var normalized = name.Trim().ToLowerInvariant();
        var ignoredFileId = excludeFileId ?? Guid.Empty;
        var ignoredFolderId = excludeFolderId ?? Guid.Empty;

        var fileExists = await db.Files.AnyAsync(
            x => x.OwnerId == ownerId
                 && x.FolderId == folderId
                 && x.DeletedAt == null
                 && x.Id != ignoredFileId
                 && x.Name.ToLower() == normalized,
            cancellationToken);

        if (fileExists)
        {
            return true;
        }

        return await db.Folders.AnyAsync(
            x => x.OwnerId == ownerId
                 && x.ParentId == folderId
                 && x.DeletedAt == null
                 && x.Id != ignoredFolderId
                 && x.Name.ToLower() == normalized,
            cancellationToken);
    }

    public static async Task<string> UniqueNameAsync(
        AppDbContext db,
        Guid ownerId,
        Guid? folderId,
        string desired,
        Guid? excludeFileId = null,
        Guid? excludeFolderId = null,
        CancellationToken cancellationToken = default)
    {
        if (!await NameExistsAsync(db, ownerId, folderId, desired, excludeFileId, excludeFolderId, cancellationToken))
        {
            return desired;
        }

        for (var index = 1; index < 1000; index++)
        {
            var suffix = index == 1 ? " (restored)" : $" (restored {index})";
            var candidate = AppendSuffix(desired, suffix);
            if (!await NameExistsAsync(db, ownerId, folderId, candidate, excludeFileId, excludeFolderId, cancellationToken))
            {
                return candidate;
            }
        }

        return AppendSuffix(desired, $" ({Guid.NewGuid():N})");
    }

    public static string AppendSuffix(string name, string suffix)
    {
        var baseLength = MaxNameLength - suffix.Length;
        return name.Length <= baseLength ? name + suffix : name[..baseLength] + suffix;
    }

    public static string? ValidateFolderName(string? name, out string cleaned)
    {
        cleaned = string.Empty;
        if (string.IsNullOrWhiteSpace(name))
        {
            return "A folder name is required.";
        }

        if (name.Contains('/') || name.Contains('\\'))
        {
            return "Folder names cannot contain slashes.";
        }

        if (name.Any(char.IsControl))
        {
            return "Folder names cannot contain control characters.";
        }

        if (name.Trim().Length > MaxNameLength)
        {
            return $"Folder names must be {MaxNameLength} characters or fewer.";
        }

        cleaned = name.Trim();
        return null;
    }

    public static string? ValidateFileName(string? name, out string cleaned)
    {
        cleaned = string.Empty;
        if (string.IsNullOrWhiteSpace(name))
        {
            return "A file name is required.";
        }

        cleaned = Path.GetFileName(name.Trim());
        if (string.IsNullOrWhiteSpace(cleaned))
        {
            return "A file name is required.";
        }

        if (cleaned is "." or "..")
        {
            return "That file name is not allowed.";
        }

        if (cleaned.Any(char.IsControl))
        {
            return "File names cannot contain control characters.";
        }

        if (cleaned.Length > MaxNameLength)
        {
            return $"File names must be {MaxNameLength} characters or fewer.";
        }

        return null;
    }
}
