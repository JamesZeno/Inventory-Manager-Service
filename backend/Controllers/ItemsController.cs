using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;

[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ItemsController(AppDbContext db) => _db = db;

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
        var items = await _db.Items
            .Where(i => i.Warehouse.CompanyId == user.CompanyId)
            .ToListAsync();
        return Ok(items);
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await GetCurrentUserAsync();
        if (user == null) return Forbid();
        var item = await _db.Items
            .FirstOrDefaultAsync(i => i.Id == id && i.Warehouse.CompanyId == user.CompanyId);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [Authorize]
    [HttpGet("warehouse/{warehouseId}")]
    public async Task<IActionResult> GetByWarehouse(int warehouseId) 
        {
        var user = await GetCurrentUserAsync();
        if (user == null) return Forbid();
        var warehouse = await _db.Warehouses.FindAsync(warehouseId);
        if (warehouse == null) return NotFound($"Warehouse with id {warehouseId} not found.");
        if (warehouse.CompanyId != user.CompanyId) return Forbid();
        var items = await _db.Items
            .Where(i => i.WarehouseId == warehouseId)
            .ToListAsync();
        return Ok(items);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create(ItemCreateDto dto)
    {
        // Ensure the user is authenticated and belongs to a company
        var user = await GetCurrentUserAsync();
        if (user == null) return Forbid();

        // Validate that the warehouse exists and belongs to the same company
        var warehouse = await _db.Warehouses.FindAsync(dto.WarehouseId);
        if (warehouse == null) return NotFound($"Warehouse with id {dto.WarehouseId} not found.");
        if (warehouse.CompanyId != user.CompanyId) return Forbid();

        // Validate that the SKU is allowed for this company
        var skuAllowed = await _db.AllowedSKUs
            .FirstOrDefaultAsync(s => s.Sku == dto.Sku && s.CompanyId == user.CompanyId);
        if (skuAllowed == null) return BadRequest($"SKU '{dto.Sku}' is not allowed for your company.");

        var item = new Item 
        { 
            CreatedAt = DateTime.UtcNow,
            Quantity = dto.Quantity,
            SkuId = skuAllowed.Id,
            WarehouseId = dto.WarehouseId
        };
        _db.Items.Add(item);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, ItemUpdateDto dto)
    {
        var item = await _db.Items.FindAsync(id);
        if (item == null) return NotFound();
        
        item.Quantity = dto.Quantity;
        item.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(item);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _db.Items.FindAsync(id);
        if (item == null) return NotFound();
        
        _db.Items.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public record ItemCreateDto(int Quantity, string Sku, int WarehouseId);
public record ItemUpdateDto(int Quantity);
