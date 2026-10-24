using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ChaosDrive.Api.Common;

/// <summary>
/// Turns malformed/malformed-shaped request bodies (thrown by minimal API JSON binding as
/// <see cref="BadHttpRequestException"/>) into a 400 ProblemDetails response. Without this,
/// the generic exception handler reports a 500 for client input errors.
/// </summary>
internal sealed class BadRequestExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (exception is not BadHttpRequestException badRequest)
        {
            return false;
        }

        var statusCode = badRequest.StatusCode is >= 400 and < 500
            ? badRequest.StatusCode
            : StatusCodes.Status400BadRequest;

        var errors = new Dictionary<string, string[]>
        {
            ["body"] = statusCode == StatusCodes.Status413PayloadTooLarge
                ? ["The request body is too large."]
                : ["The request body is not valid JSON."]
        };

        var problem = new HttpValidationProblemDetails(errors)
        {
            Status = statusCode,
            Title = statusCode == StatusCodes.Status413PayloadTooLarge
                ? "Request body too large."
                : "One or more validation errors occurred."
        };

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(
            problem,
            options: null,
            contentType: "application/problem+json",
            cancellationToken: cancellationToken);

        return true;
    }
}
