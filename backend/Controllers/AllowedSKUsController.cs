using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class AllowedSKUsController : ControllerBase
{
    private readonly AppDbContext _db;
    public AllowedSKUsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _db.AllowedSKUs.ToListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var sku = await _db.AllowedSKUs.FindAsync(id);
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
        };
        _db.AllowedSKUs.Add(sku);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = sku.Id }, sku);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, AllowedSKUUpdateDto dto)
    {
        var sku = await _db.AllowedSKUs.FindAsync(id);
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
        var sku = await _db.AllowedSKUs.FindAsync(id);
        if (sku == null) return NotFound();
        _db.AllowedSKUs.Remove(sku);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public record AllowedSKUCreateDto(string Sku, string Description);
public record AllowedSKUUpdateDto(string Sku, string Description);
