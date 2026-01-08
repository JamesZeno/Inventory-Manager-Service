public class AllowedSKU
{
    public int Id { get; set; }
    public string Sku { get; set; } = default!;
    public string Description { get; set; } = default!;
    public int CompanyId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
