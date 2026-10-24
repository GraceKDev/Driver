using ChaosDrive.Api.Data.Entities;
using ChaosDrive.Api.Features.Drive;

namespace ChaosDrive.Api.Tests;

public class DriveHelpersTests
{
    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void ValidateFolderName_RequiresAName(string? value)
    {
        var error = DriveHelpers.ValidateFolderName(value, out var cleaned);

        Assert.NotNull(error);
        Assert.Empty(cleaned);
    }

    [Theory]
    [InlineData("a/b")]
    [InlineData("a\\b")]
    [InlineData("line\nbreak")]
    public void ValidateFolderName_RejectsSeparatorsAndControlCharacters(string value)
    {
        Assert.NotNull(DriveHelpers.ValidateFolderName(value, out _));
    }

    [Fact]
    public void ValidateFolderName_RejectsNamesLongerThan255Characters()
    {
        Assert.NotNull(DriveHelpers.ValidateFolderName(new string('a', 256), out _));
        Assert.Null(DriveHelpers.ValidateFolderName(new string('a', 255), out var cleaned));
        Assert.Equal(255, cleaned.Length);
    }

    [Fact]
    public void ValidateFolderName_TrimsSurroundingWhitespace()
    {
        Assert.Null(DriveHelpers.ValidateFolderName("  Projects  ", out var cleaned));
        Assert.Equal("Projects", cleaned);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(".")]
    [InlineData("..")]
    [InlineData("bad\u0000name")]
    public void ValidateFileName_RejectsInvalidNames(string? value)
    {
        Assert.NotNull(DriveHelpers.ValidateFileName(value, out _));
    }

    [Fact]
    public void ValidateFileName_StripsDirectoryComponents()
    {
        Assert.Null(DriveHelpers.ValidateFileName("  ../../etc/passwd  ", out var cleaned));
        Assert.Equal("passwd", cleaned);
    }

    [Fact]
    public void ValidateFileName_EnforcesLengthLimit()
    {
        Assert.NotNull(DriveHelpers.ValidateFileName(new string('a', 256), out _));
        Assert.Null(DriveHelpers.ValidateFileName(new string('a', 255), out var cleaned));
        Assert.Equal(255, cleaned.Length);
    }

    [Fact]
    public void CollectFolderIds_ReturnsRootAndAllDescendantsOnly()
    {
        var root = new Folder { Id = Guid.NewGuid() };
        var child = new Folder { Id = Guid.NewGuid(), ParentId = root.Id };
        var grandchild = new Folder { Id = Guid.NewGuid(), ParentId = child.Id };
        var unrelated = new Folder { Id = Guid.NewGuid() };
        var unrelatedChild = new Folder { Id = Guid.NewGuid(), ParentId = unrelated.Id };

        var ids = DriveHelpers.CollectFolderIds(
            root.Id,
            [root, child, grandchild, unrelated, unrelatedChild]);

        Assert.Equal(3, ids.Count);
        Assert.Contains(root.Id, ids);
        Assert.Contains(child.Id, ids);
        Assert.Contains(grandchild.Id, ids);
        Assert.DoesNotContain(unrelated.Id, ids);
        Assert.DoesNotContain(unrelatedChild.Id, ids);
    }

    [Fact]
    public void CollectFolderIds_TerminatesOnACycle()
    {
        var first = new Folder { Id = Guid.NewGuid() };
        var second = new Folder { Id = Guid.NewGuid(), ParentId = first.Id };
        first.ParentId = second.Id;

        var ids = DriveHelpers.CollectFolderIds(first.Id, [first, second]);

        Assert.Equal(2, ids.Count);
    }

    [Fact]
    public void AppendSuffix_TruncatesTheBaseNameToStayWithinTheColumnLimit()
    {
        var candidate = DriveHelpers.AppendSuffix(new string('a', 255), " (restored)");

        Assert.Equal(255, candidate.Length);
        Assert.EndsWith(" (restored)", candidate);
    }

    [Fact]
    public void AppendSuffix_LeavesShortNamesIntact()
    {
        Assert.Equal("Report.txt (restored)", DriveHelpers.AppendSuffix("Report.txt", " (restored)"));
    }

    [Theory]
    [InlineData(100, "100 bytes")]
    [InlineData(1536, "1.5 KB")]
    [InlineData(104857600, "100 MB")]
    public void FormatFileSize_ProducesAReadableValue(long bytes, string expected)
    {
        Assert.Equal(expected, DriveHelpers.FormatFileSize(bytes));
    }

    [Fact]
    public void BuildBreadcrumbs_OrdersFromRootToLeaf()
    {
        var root = new Folder { Id = Guid.NewGuid(), Name = "Root" };
        var child = new Folder { Id = Guid.NewGuid(), Name = "Child", ParentId = root.Id };
        var leaf = new Folder { Id = Guid.NewGuid(), Name = "Leaf", ParentId = child.Id };
        var folders = new[] { root, child, leaf }.ToDictionary(x => x.Id);

        var crumbs = DriveHelpers.BuildBreadcrumbs(leaf.Id, folders);

        Assert.Equal(["Root", "Child", "Leaf"], crumbs.Select(x => x.Name));
        Assert.Equal("/Root/Child/Leaf", DriveHelpers.BuildPath(leaf.Id, folders));
        Assert.Equal("/", DriveHelpers.BuildPath(null, folders));
    }

    [Fact]
    public void BuildBreadcrumbs_StopsWhenAnAncestorIsMissing()
    {
        var folder = new Folder { Id = Guid.NewGuid(), Name = "Orphan", ParentId = Guid.NewGuid() };
        var folders = new[] { folder }.ToDictionary(x => x.Id);

        var crumbs = DriveHelpers.BuildBreadcrumbs(folder.Id, folders);

        Assert.Single(crumbs);
        Assert.Equal("Orphan", crumbs[0].Name);
        Assert.Equal("/Orphan", DriveHelpers.BuildPath(folder.Id, folders));
    }

    [Fact]
    public void BuildBreadcrumbs_TerminatesOnACycle()
    {
        var first = new Folder { Id = Guid.NewGuid(), Name = "First" };
        var second = new Folder { Id = Guid.NewGuid(), Name = "Second", ParentId = first.Id };
        first.ParentId = second.Id;
        var folders = new[] { first, second }.ToDictionary(x => x.Id);

        var crumbs = DriveHelpers.BuildBreadcrumbs(first.Id, folders);

        Assert.Equal(2, crumbs.Count);
    }
}
