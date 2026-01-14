using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System.Collections.Generic;
using System.Net.Http.Headers;
using System.Net.Http;
using Backend.Helper;

namespace Backend.Tests.Utils;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    public string AdminToken { get; private set; } = string.Empty;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((context, conf) =>
        {
            // Ensure valid JWT settings for TokenService
            var dict = new Dictionary<string, string>
            {
                ["Jwt:Key"] = "ThisIsAdevKeyReplaceInProd1234567890",
                ["Jwt:Issuer"] = "inventory-starter"
            };
            conf.AddInMemoryCollection(dict);
        });

        builder.ConfigureServices(services =>
        {
            // Remove any existing AppDbContext/DbContextOptions registrations (Sqlite from app + any others)
            services.RemoveAll(typeof(DbContextOptions<AppDbContext>));
            services.RemoveAll(typeof(AppDbContext));

            // Register in-memory DB for tests
            services.AddDbContext<AppDbContext>(opts => opts.UseInMemoryDatabase("TestDb"));

            // NOTE: seeding will be performed after the host has been built to avoid EF provider conflicts
        });

        // ensure the test host is used
        // Add a helper to seed the DB safely after host startup
        builder.UseEnvironment("Testing");
    }

    public HttpClient CreateClientWithToken(string token)
    {
        var client = this.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    // Safe post-startup seeding to avoid EF provider registration conflicts during host build
    public void EnsureSeeded()
    {
        if (!string.IsNullOrEmpty(AdminToken)) return;

        using var scope = this.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Reset DB
        db.Database.EnsureDeleted();
        db.Database.EnsureCreated();

        // seed data
        var company = new Company { Name = "TestCo" };
        db.Companies.Add(company);
        db.SaveChanges();

        // create admin user
        PasswordHashing.CreatePasswordHash("adminpass", out var hash, out var salt);
        var admin = new User
        {
            Username = "admin@test",
            FirstName = "Admin",
            LastName = "User",
            Role = UserRole.Admin,
            CompanyId = company.Id,
            PasswordHash = hash,
            PasswordSalt = salt
        };
        db.Users.Add(admin);
        db.SaveChanges();

        // add a warehouse and item
        var wh = new Warehouse { Name = "Main", Location = "HQ", CompanyId = company.Id };
        db.Warehouses.Add(wh);
        db.SaveChanges();

        var sku = new AllowedSKU {Sku = "SKU1", Description = "Test Item", CompanyId = company.Id};
        db.AllowedSKUs.Add(sku);
        db.SaveChanges();

        var item = new Item { SkuId = sku.Id, Quantity = 10, WarehouseId = wh.Id };
        db.Items.Add(item);
        db.SaveChanges();

        // create token for admin
        var tokenSvc = scope.ServiceProvider.GetRequiredService<TokenService>();
        var (token, jti, expires) = tokenSvc.CreateToken(admin.Username);
        AdminToken = token;
    }
}
