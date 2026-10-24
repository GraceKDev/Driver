namespace ChaosDrive.Api.Data.Entities;

public class FileItem
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public ApplicationUser Owner { get; set; } = null!;

    public Guid? FolderId { get; set; }
    public Folder? Folder { get; set; }

    public string Name { get; set; } = string.Empty;
    public string ContentType { get; set; } = "application/octet-stream";
    public long SizeBytes { get; set; }
    public long? DeclaredSizeBytes { get; set; }
    public string S3Key { get; set; } = string.Empty;

    /// <summary>pending or ready</summary>
    public string Status { get; set; } = "pending";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }
    public Guid? TrashRootId { get; set; }
}
