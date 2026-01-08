public class Item
{
    public int Id { get; set; }
    public int Quantity { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Foreign Key
    public int WarehouseId { get; set; }
    public int SkuId { get; set; }
    
    // Navigation Property
    public Warehouse Warehouse { get; set; } = default!;
    public AllowedSKU AllowedSKU { get; set; } = default!;
}