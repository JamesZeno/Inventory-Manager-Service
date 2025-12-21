using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;
    public UsersController(AppDbContext db) => _db = db;

    // Get company users (accessible to company users, filtered appropriately)
    [HttpGet("company")]
    public async Task<IActionResult> GetCompanyUsers()
    {
        var username = User.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrEmpty(username)) return Unauthorized();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (user == null) return NotFound("User not found");

        var companyUsers = await _db.Users
            .Where(u => u.CompanyId == user.CompanyId)
            .Select(u => new { u.Id, u.Username, u.FirstName, u.LastName, Role = u.Role.ToString(), u.CreatedAt })
            .ToListAsync();

        return Ok(companyUsers);
    }

    // Create new user (admin only)
    [HttpPost("create")]
    public async Task<IActionResult> CreateUser(CreateUserDto dto)
    {
        var username = User.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrEmpty(username)) return Unauthorized();

        var admin = await _db.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (admin == null) return NotFound("Admin user not found");
        if (admin.Role != UserRole.Admin) return Forbid();

        if (await _db.Users.AnyAsync(u => u.Username == dto.Username))
            return BadRequest("Username already exists");

        // Hash password
        CreatePasswordHash(dto.Password, out var hash, out var salt);

        var newUser = new User
        {
            Username = dto.Username,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Role = dto.Role,
            CompanyId = admin.CompanyId,
            PasswordHash = hash,
            PasswordSalt = salt
        };

        _db.Users.Add(newUser);
        await _db.SaveChangesAsync();

        return Ok(new { message = "User created successfully", id = newUser.Id });
    }

    // Update user (admin only)
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, UpdateUserDto dto)
    {
        var username = User.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrEmpty(username)) return Unauthorized();

        var admin = await _db.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (admin == null) return NotFound("Admin user not found");
        if (admin.Role != UserRole.Admin) return Forbid();

        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound("User not found");

        // Ensure user belongs to admin's company
        if (user.CompanyId != admin.CompanyId) return Forbid();

        // Prevent demoting the last admin
        if (user.Role == UserRole.Admin && dto.Role != UserRole.Admin)
        {
            var adminCount = await _db.Users.CountAsync(u => u.CompanyId == admin.CompanyId && u.Role == UserRole.Admin);
            if (adminCount == 1) return BadRequest("Cannot remove the last admin");
        }

        user.FirstName = dto.FirstName ?? user.FirstName;
        user.LastName = dto.LastName ?? user.LastName;
        user.Role = dto.Role ?? user.Role;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { message = "User updated successfully" });
    }

    // Delete user (admin only)
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var username = User.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrEmpty(username)) return Unauthorized();

        var admin = await _db.Users.FirstOrDefaultAsync(u => u.Username == username);
        if (admin == null) return NotFound("Admin user not found");
        if (admin.Role != UserRole.Admin) return Forbid();

        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound("User not found");

        // Ensure user belongs to admin's company
        if (user.CompanyId != admin.CompanyId) return Forbid();

        // Prevent deleting the last admin
        if (user.Role == UserRole.Admin)
        {
            var adminCount = await _db.Users.CountAsync(u => u.CompanyId == admin.CompanyId && u.Role == UserRole.Admin);
            if (adminCount == 1) return BadRequest("Cannot delete the last admin");
        }

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    public static void CreatePasswordHash(string pwd, out byte[] hash, out byte[] salt)
    {
        using var hmac = new System.Security.Cryptography.HMACSHA512();
        salt = hmac.Key;
        hash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(pwd));
    }
}

public record CreateUserDto(string Username, string Password, string FirstName, string LastName, UserRole Role);
public record UpdateUserDto(string? FirstName, string? LastName, UserRole? Role);
