using ChaosDrive.Api.Data;
using ChaosDrive.Api.Data.Entities;
using Microsoft.AspNetCore.Identity;

namespace ChaosDrive.Api.Data;

public static class SeedData
{
    public const string DemoEmail = "demo@chaosdrive.app";
    public const string DemoPassword = "ChaosDrive123!";

    public static async Task InitializeAsync(IServiceProvider services, ILogger logger)
    {
        using var scope = services.CreateScope();
        var users = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var existing = await users.FindByEmailAsync(DemoEmail);
        if (existing is not null)
        {
            return;
        }

        var demo = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = DemoEmail,
            Email = DemoEmail,
            DisplayName = "Demo Desk",
            CreatedAt = DateTime.UtcNow
        };

        var created = await users.CreateAsync(demo, DemoPassword);
        if (!created.Succeeded)
        {
            logger.LogWarning(
                "Could not seed the demo user: {Errors}",
                string.Join("; ", created.Errors.Select(x => x.Description)));
            return;
        }

        var now = DateTime.UtcNow;
        var invoices = new Folder
        {
            Id = Guid.NewGuid(),
            OwnerId = demo.Id,
            Name = "Invoices",
            CreatedAt = now,
            UpdatedAt = now
        };
        var design = new Folder
        {
            Id = Guid.NewGuid(),
            OwnerId = demo.Id,
            Name = "Design References",
            CreatedAt = now,
            UpdatedAt = now
        };
        var secret = new Folder
        {
            Id = Guid.NewGuid(),
            OwnerId = demo.Id,
            Name = "Top Secret",
            CreatedAt = now,
            UpdatedAt = now
        };

        db.Folders.AddRange(invoices, design, secret);
        await db.SaveChangesAsync();

        db.Folders.Add(new Folder
        {
            Id = Guid.NewGuid(),
            OwnerId = demo.Id,
            ParentId = invoices.Id,
            Name = "2026",
            CreatedAt = now,
            UpdatedAt = now
        });
        await db.SaveChangesAsync();

        logger.LogInformation("Seeded the demo desk: {Email} / {Password}", DemoEmail, DemoPassword);
    }
}
