namespace ChaosDrive.Api.Features.Drive;

public record UserDto(
    Guid Id,
    string DisplayName,
    string Email,
    long StorageUsedBytes,
    long StorageQuotaBytes);

public record RegisterRequest(string DisplayName, string Email, string Password);
public record LoginRequest(string Email, string Password);

public record FolderDto(Guid Id, string Name, DateTime CreatedAt, DateTime UpdatedAt);
public record FileDto(Guid Id, string Name, string ContentType, long SizeBytes, DateTime CreatedAt, DateTime UpdatedAt);
public record BreadcrumbDto(Guid Id, string Name);
public record StorageDto(long UsedBytes, long QuotaBytes);

public record DriveResponse(
    Guid? FolderId,
    IReadOnlyList<BreadcrumbDto> Breadcrumbs,
    IReadOnlyList<FolderDto> Folders,
    IReadOnlyList<FileDto> Files,
    StorageDto Storage);

public record CreateFolderRequest(string Name, Guid? ParentId);
public record RenameRequest(string Name);

public record CreateUploadRequest(Guid? FolderId, string FileName, string ContentType, long SizeBytes);
public record UploadTicketDto(Guid FileId, string UploadUrl, DateTime ExpiresAt);

public record TrashItemDto(
    Guid Id,
    string Name,
    string Kind,
    long? SizeBytes,
    DateTime DeletedAt,
    string OriginalPath);

public record TrashResponse(IReadOnlyList<TrashItemDto> Items, StorageDto Storage);

public record SearchFolderDto(Guid Id, string Name, string Path);
public record SearchFileDto(Guid Id, string Name, string ContentType, long SizeBytes, Guid? FolderId, string Path);
public record SearchResponse(IReadOnlyList<SearchFolderDto> Folders, IReadOnlyList<SearchFileDto> Files);
