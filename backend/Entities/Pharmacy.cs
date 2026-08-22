namespace MedicineAvailability.Api.Entities
{
    public class Pharmacy
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string LicenseNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string ContactPhone { get; set; } = string.Empty;
        public string ContactEmail { get; set; } = string.Empty;
        public string OperatingHours { get; set; } = string.Empty;
        public bool IsApproved { get; set; } = false;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual ICollection<PharmacyInventory> Inventories { get; set; } = new List<PharmacyInventory>();
        public virtual ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
        public virtual ICollection<PharmacyStockRequest> OutgoingStockRequests { get; set; } = new List<PharmacyStockRequest>();
        public virtual ICollection<PharmacyStockRequest> IncomingStockRequests { get; set; } = new List<PharmacyStockRequest>();
    }
}
