public class Company
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    
    // Navigation Properties
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Warehouse> Warehouses { get; set; } = new List<Warehouse>();
    public ICollection<AllowedSKU> AllowedSKUs { get; set; } = new List<AllowedSKU>();
}
