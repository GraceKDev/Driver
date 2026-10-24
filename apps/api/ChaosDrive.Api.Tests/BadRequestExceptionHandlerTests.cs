using ChaosDrive.Api.Common;
using Microsoft.AspNetCore.Http;

namespace ChaosDrive.Api.Tests;

public class BadRequestExceptionHandlerTests
{
    [Fact]
    public async Task MalformedJson_Returns400ProblemDetails()
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        var handler = new BadRequestExceptionHandler();

        var handled = await handler.TryHandleAsync(
            context,
            new BadHttpRequestException("Failed to read the request body as JSON."),
            CancellationToken.None);

        Assert.True(handled);
        Assert.Equal(StatusCodes.Status400BadRequest, context.Response.StatusCode);
        Assert.StartsWith("application/problem+json", context.Response.ContentType);
    }

    [Fact]
    public async Task RequestTooLarge_Preserves413Status()
    {
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();
        var handler = new BadRequestExceptionHandler();

        var handled = await handler.TryHandleAsync(
            context,
            new BadHttpRequestException("Request body too large.", StatusCodes.Status413PayloadTooLarge),
            CancellationToken.None);

        Assert.True(handled);
        Assert.Equal(StatusCodes.Status413PayloadTooLarge, context.Response.StatusCode);
    }

    [Fact]
    public async Task OtherExceptions_AreNotHandled()
    {
        var context = new DefaultHttpContext();
        var handler = new BadRequestExceptionHandler();

        var handled = await handler.TryHandleAsync(
            context,
            new InvalidOperationException("boom"),
            CancellationToken.None);

        Assert.False(handled);
    }
}
