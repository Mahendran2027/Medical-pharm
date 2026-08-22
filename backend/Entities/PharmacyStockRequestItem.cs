namespace MedicineAvailability.Api.Entities
{
    public class PharmacyStockRequestItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid StockRequestId { get; set; }
        public Guid MedicineId { get; set; }
        public int RequestedQuantity { get; set; }
        public int? ApprovedQuantity { get; set; }

        // Navigation
        public virtual PharmacyStockRequest StockRequest { get; set; } = null!;
        public virtual Medicine Medicine { get; set; } = null!;
    }
}
