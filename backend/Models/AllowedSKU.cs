public class AllowedSKU
{
    public int Id { get; set; }
    public string Sku { get; set; } = default!;
    public string Description { get; set; } = default!;
    public int CompanyId { get; set; }
    // Navigation property
    public Company Company { get; set; } = default!;
}
