namespace MedicineAvailability.Api.Entities
{
    public class PharmacyInventory
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid PharmacyId { get; set; }
        public Guid MedicineId { get; set; }
        public int QuantityOnHand { get; set; }
        public int ReservedQuantity { get; set; }
        public int AvailableQuantity => Math.Max(0, QuantityOnHand - ReservedQuantity);
        public decimal UnitPrice { get; set; }
        public int LowStockThreshold { get; set; } = 10;
        public string BatchNumber { get; set; } = string.Empty;
        public DateTime? ExpiryDate { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime LastStockUpdate { get; set; } = DateTime.UtcNow;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Concurrency token / Versioning
        public byte[] RowVersion { get; set; } = Array.Empty<byte>();

        // Navigation properties
        public virtual Pharmacy Pharmacy { get; set; } = null!;
        public virtual Medicine Medicine { get; set; } = null!;
        public virtual ICollection<InventoryTransaction> Transactions { get; set; } = new List<InventoryTransaction>();
        public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}
