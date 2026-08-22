namespace MedicineAvailability.Api.DTOs.Notifications
{
    public class NotificationResponseDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public string TargetUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
