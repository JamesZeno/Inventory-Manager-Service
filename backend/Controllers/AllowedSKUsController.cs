using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class AllowedSKUsController : ControllerBase
{
    private readonly AppDbContext _db;
    public AllowedSKUsController(AppDbContext db) => _db = db;

    /// <summary>
    /// Retrieves the authenticated user from the database using the username claim.
    /// Returns null if the user cannot be found.
    /// </summary>
    private async Task<User?> GetCurrentUserAsync()
    {
        // The username is typically stored in the "name" claim.
        var username = User.FindFirst("name")?.Value ?? User.Identity?.Name;
        if (string.IsNullOrEmpty(username)) return null;
        return await _db.Users.FirstOrDefaultAsync(u => u.Username == username);
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var user = await GetCurrentUserAsync();
        if (user == null) return Forbid();
        var companyId = user.CompanyId;

        var skus = await _db.AllowedSKUs
            .Where(s => s.CompanyId == companyId)
            .ToListAsync();
        return Ok(skus);
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await GetCurrentUserAsync();
        if (user == null) return Forbid();
        var companyId = user.CompanyId;
        var sku = await _db.AllowedSKUs
            .FirstOrDefaultAsync(s => s.Id == id && s.CompanyId == companyId);
        if (sku == null) return NotFound();
        return Ok(sku);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create(AllowedSKUCreateDto dto)
    {
        var sku = new AllowedSKU
        {
            Sku = dto.Sku,
            Description = dto.Description
            ,CompanyId = (await GetCurrentUserAsync())!.CompanyId
        };
        _db.AllowedSKUs.Add(sku);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = sku.Id }, sku);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, AllowedSKUUpdateDto dto)
    {
        var user = await GetCurrentUserAsync();
        if (user == null) return Forbid();
        var companyId = user.CompanyId;
        var sku = await _db.AllowedSKUs
            .FirstOrDefaultAsync(s => s.Id == id && s.CompanyId == companyId);
        if (sku == null) return NotFound();
        sku.Sku = dto.Sku;
        sku.Description = dto.Description;
        sku.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(sku);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await GetCurrentUserAsync();
        if (user == null) return Forbid();
        var companyId = user.CompanyId;
        var sku = await _db.AllowedSKUs
            .FirstOrDefaultAsync(s => s.Id == id && s.CompanyId == companyId);
        if (sku == null) return NotFound();
        _db.AllowedSKUs.Remove(sku);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public record AllowedSKUCreateDto(string Sku, string Description);
public record AllowedSKUUpdateDto(string Sku, string Description);
