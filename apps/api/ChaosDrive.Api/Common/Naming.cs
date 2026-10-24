namespace ChaosDrive.Api.Common;

public static class Naming
{
    public static string CleanFileName(string value)
    {
        var name = Path.GetFileName(value.Trim());
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("A file name is required.", nameof(value));
        }

        return name.Length > 255 ? name[..255] : name;
    }

    public static string CleanFolderName(string value)
    {
        var name = value.Trim();
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("A folder name is required.", nameof(value));
        }

        if (name.Contains('/') || name.Contains('\\'))
        {
            throw new ArgumentException("Folder names cannot contain slashes.", nameof(value));
        }

        return name.Length > 255 ? name[..255] : name;
    }

    public static string SanitizeKeySegment(string value)
    {
        var invalid = Path.GetInvalidFileNameChars();
        var cleaned = new string(value.Select(c => invalid.Contains(c) ? '_' : c).ToArray());
        return string.IsNullOrWhiteSpace(cleaned) || cleaned is "." or ".." ? "file" : cleaned;
    }

    public static string EscapeLike(string value)
    {
        return value.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
    }
}
