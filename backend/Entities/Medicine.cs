namespace MedicineAvailability.Api.Entities
{
    public class Medicine
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string GenericName { get; set; } = string.Empty;
        public string BrandName { get; set; } = string.Empty;
        public string Manufacturer { get; set; } = string.Empty;
        public string DosageForm { get; set; } = string.Empty; // Tablet, Syrup, Injection, etc.
        public string Strength { get; set; } = string.Empty;   // e.g. 500mg, 10mg/5ml
        public string Description { get; set; } = string.Empty;
        public bool RequiresPrescription { get; set; } = false;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual MedicineCategory Category { get; set; } = null!;
        public virtual ICollection<PharmacyInventory> Inventories { get; set; } = new List<PharmacyInventory>();
    }
}
