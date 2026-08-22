namespace MedicineAvailability.Api.Entities
{
    public enum TransactionType
    {
        StockAddition = 1,
        ManualAdjustment = 2,
        ReservationHold = 3,
        ReservationFulfillment = 4,
        ReservationCancellation = 5,
        ReservationExpiration = 6,
        StockTransfer = 7,
        StockRemoval = 8
    }

    public class InventoryTransaction
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid PharmacyInventoryId { get; set; }
        public TransactionType Type { get; set; }
        public int QuantityChange { get; set; }
        public int NewQuantityOnHand { get; set; }
        public int NewReservedQuantity { get; set; }
        public string ReferenceNumber { get; set; } = string.Empty;
        public string Note { get; set; } = string.Empty;
        public Guid PerformedByUserId { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual PharmacyInventory PharmacyInventory { get; set; } = null!;
        public virtual User PerformedByUser { get; set; } = null!;
    }
}
