using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Backend.Helper;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TokenService _tokens;
    private readonly ITokenRevocationService _revocationService;

    public AuthController(AppDbContext db, TokenService tokens, ITokenRevocationService revocationService)
    {
        _db = db;
        _tokens = tokens;
        _revocationService = revocationService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Username == dto.Username)) return BadRequest("User exists");

        // Find company by name (case-insensitive). If it doesn't exist, create it.
        var company = await _db.Companies.SingleOrDefaultAsync(c => c.Name.ToLower() == dto.CompanyName.ToLower());
        if (company == null)
        {
            company = new Company { Name = dto.CompanyName };
            _db.Companies.Add(company);
            await _db.SaveChangesAsync();
        }

        // Check if there are existing users in the company
        var existingUserCount = await _db.Users.CountAsync(u => u.CompanyId == company.Id);

        // First user is admin; subsequent users need admin authorization
        UserRole role = UserRole.Employee;
        if (existingUserCount == 0)
        {
            role = UserRole.Admin;
        }
        else
        {
            // Non-first user requires admin context (checked via JWT)
            var adminUsername = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(adminUsername))
            {
                return BadRequest("Admin authorization required for new user registration");
            }

            var admin = await _db.Users.SingleOrDefaultAsync(u => u.Username == adminUsername && u.CompanyId == company.Id && u.Role == UserRole.Admin);
            if (admin == null)
            {
                return BadRequest("Only admin can register new users for this company");
            }
        }

        PasswordHashing.CreatePasswordHash(dto.Password, out var hash, out var salt);
        var user = new User 
        { 
            Username = dto.Username, 
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Role = role,
            CompanyId = company.Id, 
            PasswordHash = hash, 
            PasswordSalt = salt 
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return Ok(new { message = "User registered successfully", role = role.ToString() });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        Console.WriteLine(dto);
        var user = await _db.Users.SingleOrDefaultAsync(u => u.Username == dto.Username);
        if (user == null) return Unauthorized();

        if (!PasswordHashing.VerifyPasswordHash(dto.Password, user.PasswordHash, user.PasswordSalt)) return Unauthorized();

        var (token, jti, expires) = _tokens.CreateToken(user.Username);
        return Ok(new { token, jti, expires });
    }

    [Authorize]
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        var jti = User.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
        if (string.IsNullOrEmpty(jti)) return BadRequest("Invalid token");

        var expClaim = User.FindFirst("exp")?.Value;
        DateTime expiresAt = DateTime.UtcNow.AddMinutes(1);
        if (long.TryParse(expClaim, out var expUnix))
        {
            expiresAt = DateTimeOffset.FromUnixTimeSeconds(expUnix).UtcDateTime;
        }

        _revocationService.RevokeToken(jti, expiresAt);
        return NoContent();
    }

    [Authorize]
    [HttpGet("userinfo")]
    public async Task<IActionResult> UserInfo()
    {
        var jti = User.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
        if (string.IsNullOrEmpty(jti)) return BadRequest("Invalid token");

        var username = User.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrEmpty(username)) return BadRequest("Invalid token");

        var user = await _db.Users
            .Include(u => u.Company)
            .FirstOrDefaultAsync(u => u.Username == username);
        
        if (user == null) return NotFound("User not found");

        return Ok(new { user.Id, user.Username, user.FirstName, user.LastName, role = user.Role.ToString(), company = user.Company.Name });
    }
}

public record RegisterDto(string Username, string Password, string FirstName, string LastName, string CompanyName);
public record LoginDto(string Username, string Password);