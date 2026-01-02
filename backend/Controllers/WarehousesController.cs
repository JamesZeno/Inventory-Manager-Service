using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class WarehousesController : ControllerBase
{
    private readonly AppDbContext _db;
    public WarehousesController(AppDbContext db) => _db = db;

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

        var warehouses = await _db.Warehouses
            .Where(w => w.CompanyId == companyId)
            .ToListAsync();
        return Ok(warehouses);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await GetCurrentUserAsync();
        if (user == null) return Forbid();

        var warehouse = await _db.Warehouses
            .Include(w => w.Items)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (warehouse == null) return NotFound();
        if (warehouse.CompanyId != user.CompanyId) return Forbid();
        return Ok(warehouse);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create(WarehouseDto dto)
    {
        var user = await GetCurrentUserAsync();
        if (user == null) return Forbid();
        var companyId = user.CompanyId;
        var warehouseOld = await _db.Warehouses
            .Where(w => w.CompanyId == companyId)
            .FirstOrDefaultAsync(w => w.Name == dto.Name);
        if (warehouseOld != null)
        {
            return Conflict();
        }
        var warehouse = new Warehouse
        {
            Name = dto.Name,
            Location = dto.Location,
            CompanyId = companyId
        };
        _db.Warehouses.Add(warehouse);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = warehouse.Id }, warehouse);
    }

    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, WarehouseDto dto)
    {
        var user = await GetCurrentUserAsync();
        if (user == null) return Forbid();

        var warehouse = await _db.Warehouses.FindAsync(id);
        if (warehouse == null) return NotFound();
        if (warehouse.CompanyId != user.CompanyId) return Forbid();

        warehouse.Name = dto.Name;
        warehouse.Location = dto.Location;
        await _db.SaveChangesAsync();
        return Ok(warehouse);
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await GetCurrentUserAsync();
        if (user == null) return Forbid();

        var warehouse = await _db.Warehouses.FindAsync(id);
        if (warehouse == null) return NotFound();
        if (warehouse.CompanyId != user.CompanyId) return Forbid();

        _db.Warehouses.Remove(warehouse);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public record WarehouseDto(string Name, string Location);
