namespace MedicineAvailability.Api.Entities
{
    public enum ReservationStatus
    {
        Pending = 1,
        Approved = 2,
        Rejected = 3,
        Fulfilled = 4,
        Cancelled = 5,
        Expired = 6
    }

    public class Reservation
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string ReservationCode { get; set; } = string.Empty;
        public Guid CustomerUserId { get; set; }
        public Guid PharmacyId { get; set; }
        public Guid PharmacyInventoryId { get; set; }
        public int QuantityRequested { get; set; }
        public decimal TotalEstimatedPrice { get; set; }
        public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
        public string RejectionReason { get; set; } = string.Empty;
        public string CustomerNote { get; set; } = string.Empty;
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ApprovedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public DateTime? CompletedAt { get; set; }

        // Navigation properties
        public virtual User CustomerUser { get; set; } = null!;
        public virtual Pharmacy Pharmacy { get; set; } = null!;
        public virtual PharmacyInventory PharmacyInventory { get; set; } = null!;
    }
}
