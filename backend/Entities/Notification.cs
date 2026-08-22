namespace MedicineAvailability.Api.Entities
{
    public enum NotificationType
    {
        Info = 1,
        ReservationStatusUpdate = 2,
        LowStockAlert = 3,
        StockRequestUpdate = 4,
        AccountApproval = 5
    }

    public class Notification
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public NotificationType Type { get; set; } = NotificationType.Info;
        public bool IsRead { get; set; } = false;
        public string TargetUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual User User { get; set; } = null!;
    }
}
