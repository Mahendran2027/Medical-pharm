namespace MedicineAvailability.Api.Entities
{
    public enum StockRequestStatus
    {
        Pending = 1,
        Approved = 2,
        Rejected = 3,
        Completed = 4,
        Cancelled = 5
    }

    public class PharmacyStockRequest
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string RequestNumber { get; set; } = string.Empty;
        public Guid RequestingPharmacyId { get; set; }
        public Guid FulfillingPharmacyId { get; set; }
        public StockRequestStatus Status { get; set; } = StockRequestStatus.Pending;
        public string Note { get; set; } = string.Empty;
        public string RejectionReason { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public virtual Pharmacy RequestingPharmacy { get; set; } = null!;
        public virtual Pharmacy FulfillingPharmacy { get; set; } = null!;
        public virtual ICollection<PharmacyStockRequestItem> Items { get; set; } = new List<PharmacyStockRequestItem>();
    }
}
