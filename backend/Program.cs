using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- Configuration ---
var databaseProvider = builder.Configuration["DatabaseProvider"] ?? "Sqlite";
var connectionString = builder.Configuration.GetConnectionString("DataBase") ?? "Data Source=inventory.db";

if (builder.Environment.IsEnvironment("Testing"))
{
    // Use in-memory DB for tests
    builder.Services.AddDbContext<AppDbContext>(opts => opts.UseInMemoryDatabase("TestDb"));
}
else
{
    // Configure database provider based on settings
    switch (databaseProvider.ToLower())
    {
        case "sqlserver":
            builder.Services.AddDbContext<AppDbContext>(opts =>
                opts.UseSqlServer(connectionString));
            break;
        case "postgresql":
            builder.Services.AddDbContext<AppDbContext>(opts =>
                opts.UseNpgsql(connectionString));
            break;
        case "mysql":
            builder.Services.AddDbContext<AppDbContext>(opts =>
                opts.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));
            break;
        case "sqlite":
        default:
            builder.Services.AddDbContext<AppDbContext>(opts =>
                opts.UseSqlite(connectionString));
            break;
    }
}

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Inventory API", Version = "v1" });
    var jwtScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT as: Bearer {token}"
    };
    c.AddSecurityDefinition("bearerAuth", jwtScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
        { jwtScheme, new string[] { } }
    });
});

// JWT setup
var jwtKey = builder.Configuration["Jwt:Key"] ?? "ThisIsAdevKeyThatIsLongEnoughForJWTSigningPurposes1234567890AB";
var issuer = builder.Configuration["Jwt:Issuer"] ?? "inventory-starter";
var keyBytes = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = issuer,
        ValidateAudience = false,
        ValidateLifetime = true,
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
        ValidateIssuerSigningKey = true
    };

    // check revocation
    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = ctx =>
        {
            var revocationSvc = ctx.HttpContext.RequestServices.GetRequiredService<ITokenRevocationService>();
            var jti = ctx.Principal?.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
            if (!string.IsNullOrEmpty(jti) && revocationSvc.IsRevoked(jti))
            {
                ctx.Fail("Token has been revoked");
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

builder.Services.AddSingleton<TokenService>();
builder.Services.AddSingleton<ITokenRevocationService, InMemoryTokenRevocationService>();

var app = builder.Build();

// --- Middleware ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors();
app.UseAuthentication();
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    //db.Database.Migrate();
    db.Database.EnsureCreated(); //Quick prototype with EnsureCreated
}

app.Run();

public partial class Program { }