using System.Threading.RateLimiting;
using Amazon;
using Microsoft.AspNetCore.RateLimiting;
using Amazon.S3;
using ChaosDrive.Api.Common;
using ChaosDrive.Api.Data;
using ChaosDrive.Api.Data.Entities;
using ChaosDrive.Api.Features.Auth;
using ChaosDrive.Api.Features.Drive;
using ChaosDrive.Api.Storage;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
 
var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? throw new InvalidOperationException("ConnectionStrings:Default is not configured.");

builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

builder.Services
    .AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
    {
        options.User.RequireUniqueEmail = true;
        options.Password.RequiredLength = 8;
        options.Password.RequireUppercase = false;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireLowercase = true;
        options.Password.RequireDigit = true;
        options.SignIn.RequireConfirmedEmail = false;
        options.Lockout.MaxFailedAccessAttempts = 8;
        options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

var secureCookie = builder.Configuration.GetValue<bool>("Cookie:Secure");
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Name = "chaosdrive.auth";
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = secureCookie
        ? CookieSecurePolicy.Always
        : CookieSecurePolicy.SameAsRequest;
    options.ExpireTimeSpan = TimeSpan.FromDays(14);
    options.SlidingExpiration = true;

    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };

    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
});

var keysPath = builder.Configuration["DataProtection:KeysPath"];
if (!string.IsNullOrWhiteSpace(keysPath))
{
    Directory.CreateDirectory(keysPath);
    builder.Services.AddDataProtection()
        .PersistKeysToFileSystem(new DirectoryInfo(keysPath))
        .SetApplicationName("ChaosDrive");
}
else
{
    builder.Services.AddDataProtection().SetApplicationName("ChaosDrive");
}

var awsRegion = builder.Configuration["AWS:Region"] ?? "ap-southeast-1";
var awsServiceUrl = builder.Configuration["AWS:ServiceUrl"];
builder.Services.AddSingleton<IAmazonS3>(_ =>
{
    var config = new AmazonS3Config
    {
        RegionEndpoint = RegionEndpoint.GetBySystemName(awsRegion),
        ForcePathStyle = !string.IsNullOrWhiteSpace(awsServiceUrl)
    };

    if (!string.IsNullOrWhiteSpace(awsServiceUrl))
    {
        config.ServiceURL = awsServiceUrl;
    }

    return new AmazonS3Client(config);
});
builder.Services.AddScoped<IFileStorage, S3FileStorage>();

builder.Services.AddOpenApi();
builder.Services.AddExceptionHandler<BadRequestExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddAuthorization();

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("auth", context =>
    {
        // AddFixedWindowLimiter registers a single, application-wide bucket. That would let
        // one client exhaust the login/register budget for every other client, so partition
        // the fixed window per remote address instead.
        var partitionKey = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(partitionKey, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 20,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0
        });
    });
});

builder.Services.AddHealthChecks();

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

var allowedOrigins = (builder.Configuration["App:Origin"] ?? "http://localhost:3000")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    .Select(origin => origin.TrimEnd('/'))
    .ToArray();

app.Use(async (context, next) =>
{
    var isUnsafe = HttpMethods.IsPost(context.Request.Method)
                   || HttpMethods.IsPut(context.Request.Method)
                   || HttpMethods.IsPatch(context.Request.Method)
                   || HttpMethods.IsDelete(context.Request.Method);

    if (isUnsafe)
    {
        var origin = context.Request.Headers.Origin.ToString().TrimEnd('/');
        var requestOrigin = $"{context.Request.Scheme}://{context.Request.Host}".TrimEnd('/');
        var isSameOrigin = string.Equals(origin, requestOrigin, StringComparison.OrdinalIgnoreCase);

        // Same-origin requests must always be accepted so the Scalar/OpenAPI UI (and any
        // other direct API client in development) keeps working. Cross-origin requests
        // are restricted to the configured web origin(s).
        if (!string.IsNullOrWhiteSpace(origin)
            && !isSameOrigin
            && !allowedOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase))
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new
            {
                title = "Requests from that origin are not allowed.",
                status = StatusCodes.Status403Forbidden
            });
            return;
        }
    }

    await next();
});

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapGet("/health", async (AppDbContext db, CancellationToken cancellationToken) =>
{
    try
    {
        return await db.Database.CanConnectAsync(cancellationToken)
            ? Results.Ok(new { status = "ok" })
            : Results.StatusCode(StatusCodes.Status503ServiceUnavailable);
    }
    catch
    {
        return Results.StatusCode(StatusCodes.Status503ServiceUnavailable);
    }
}).AllowAnonymous();

app.MapAuthEndpoints();
app.MapDriveEndpoints();
app.MapFolderEndpoints();
app.MapFileEndpoints();

if (app.Environment.IsDevelopment())
{
    await SeedData.InitializeAsync(app.Services, app.Logger);
}

app.Run();
