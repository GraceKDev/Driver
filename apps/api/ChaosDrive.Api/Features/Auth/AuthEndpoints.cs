using System.Net.Mail;
using ChaosDrive.Api.Common;
using ChaosDrive.Api.Data;
using ChaosDrive.Api.Data.Entities;
using ChaosDrive.Api.Features.Drive;
using Microsoft.AspNetCore.Identity;

namespace ChaosDrive.Api.Features.Auth;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/register", RegisterAsync)
            .AllowAnonymous()
            .RequireRateLimiting("auth")
            .WithName("Register");

        group.MapPost("/login", LoginAsync)
            .AllowAnonymous()
            .RequireRateLimiting("auth")
            .WithName("Login");

        group.MapPost("/logout", LogoutAsync)
            .AllowAnonymous()
            .WithName("Logout");

        group.MapGet("/me", MeAsync)
            .RequireAuthorization()
            .WithName("Me");

        return app;
    }

    private static async Task<IResult> RegisterAsync(
        RegisterRequest? request,
        UserManager<ApplicationUser> users,
        SignInManager<ApplicationUser> signIn,
        AppDbContext db,
        IConfiguration configuration,
        CancellationToken cancellationToken)
    {
        if (request is null)
        {
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["body"] = ["A request body is required."]
            });
        }

        var errors = new Dictionary<string, string[]>();
        var displayName = (request.DisplayName ?? string.Empty).Trim();
        var email = (request.Email ?? string.Empty).Trim().ToLowerInvariant();

        if (displayName.Length is < 1 or > 100 || displayName.Any(char.IsControl))
        {
            errors["displayName"] = ["Enter a name up to 100 characters."];
        }

        // Identity's Email/UserName columns are varchar(256); reject longer values up front
        // instead of letting the database throw while creating the user.
        if (email.Length > 256 || !MailAddress.TryCreate(email, out _))
        {
            errors["email"] = ["Enter a valid email address."];
        }

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8)
        {
            errors["password"] = ["Use at least 8 characters."];
        }

        if (errors.Count > 0)
        {
            return Results.ValidationProblem(errors);
        }

        if (await users.FindByEmailAsync(email) is not null)
        {
            return Results.Conflict(new
            {
                title = "That email is already on file.",
                status = StatusCodes.Status409Conflict
            });
        }

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = email,
            Email = email,
            DisplayName = displayName,
            CreatedAt = DateTime.UtcNow
        };

        var result = await users.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return Results.ValidationProblem(result.Errors
                .GroupBy(x => x.Code.Contains("Password", StringComparison.OrdinalIgnoreCase) ? "password" : "email")
                .ToDictionary(
                    x => x.Key,
                    x => x.Select(error => error.Description).ToArray()));
        }

        await signIn.SignInAsync(user, isPersistent: true);
        return Results.Created("/api/auth/me", await ToUserDtoAsync(user, db, configuration, cancellationToken));
    }

    private static async Task<IResult> LoginAsync(
        LoginRequest? request,
        UserManager<ApplicationUser> users,
        SignInManager<ApplicationUser> signIn,
        AppDbContext db,
        IConfiguration configuration,
        CancellationToken cancellationToken)
    {
        if (request is null)
        {
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["body"] = ["A request body is required."]
            });
        }

        var email = (request.Email ?? string.Empty).Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return Results.ValidationProblem(new Dictionary<string, string[]>
            {
                ["email"] = ["Enter your email and password."]
            });
        }

        var user = await users.FindByEmailAsync(email);
        if (user is null)
        {
            return InvalidLogin();
        }

        var result = await signIn.PasswordSignInAsync(
            user,
            request.Password,
            isPersistent: true,
            lockoutOnFailure: true);

        if (result.IsLockedOut)
        {
            return Results.Problem(
                title: "That account is temporarily locked. Try again in a few minutes.",
                statusCode: StatusCodes.Status423Locked);
        }

        if (!result.Succeeded)
        {
            return InvalidLogin();
        }

        return Results.Ok(await ToUserDtoAsync(user, db, configuration, cancellationToken));
    }

    private static async Task<IResult> LogoutAsync(SignInManager<ApplicationUser> signIn)
    {
        await signIn.SignOutAsync();
        return Results.NoContent();
    }

    private static async Task<IResult> MeAsync(
        HttpContext http,
        UserManager<ApplicationUser> users,
        AppDbContext db,
        IConfiguration configuration,
        CancellationToken cancellationToken)
    {
        var user = await users.FindByIdAsync(http.User.GetUserId().ToString());
        if (user is null)
        {
            return Results.Unauthorized();
        }

        return Results.Ok(await ToUserDtoAsync(user, db, configuration, cancellationToken));
    }

    private static IResult InvalidLogin()
        => Results.Problem(
            title: "That email and password combination does not match.",
            statusCode: StatusCodes.Status401Unauthorized);

    private static async Task<UserDto> ToUserDtoAsync(
        ApplicationUser user,
        AppDbContext db,
        IConfiguration configuration,
        CancellationToken cancellationToken)
    {
        var used = await DriveHelpers.GetUsedBytesAsync(db, user.Id, cancellationToken);
        return new UserDto(
            user.Id,
            user.DisplayName,
            user.Email ?? string.Empty,
            used,
            DriveHelpers.GetQuota(configuration));
    }
}
