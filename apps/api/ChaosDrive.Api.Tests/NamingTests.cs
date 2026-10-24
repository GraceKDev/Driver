using ChaosDrive.Api.Common;

namespace ChaosDrive.Api.Tests;

public class NamingTests
{
    [Fact]
    public void EscapeLike_EscapesEveryLikeMetacharacter()
    {
        Assert.Equal("a\\%b\\_c\\\\d", Naming.EscapeLike("a%b_c\\d"));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(".")]
    [InlineData("..")]
    public void SanitizeKeySegment_AlwaysReturnsAUsableSegment(string value)
    {
        Assert.Equal("file", Naming.SanitizeKeySegment(value));
    }

    [Fact]
    public void SanitizeKeySegment_ReplacesInvalidFileNameCharacters()
    {
        Assert.Equal("a_b", Naming.SanitizeKeySegment("a/b"));
    }
}
