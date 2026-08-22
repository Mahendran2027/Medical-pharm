using System.ComponentModel.DataAnnotations;
using MedicineAvailability.Api.Entities;

namespace MedicineAvailability.Api.DTOs.Reservations
{
    public class CreateReservationDto
    {
        [Required]
        public Guid PharmacyInventoryId { get; set; }

        [Required]
        [Range(1, 100, ErrorMessage = "Quantity requested must be between 1 and 100.")]
        public int QuantityRequested { get; set; }

        public string CustomerNote { get; set; } = string.Empty;
    }

    public class UpdateReservationStatusDto
    {
        [Required]
        public ReservationStatus Status { get; set; }

        public string ReasonOrNote { get; set; } = string.Empty;
    }

    public class ReservationResponseDto
    {
        public Guid Id { get; set; }
        public string ReservationCode { get; set; } = string.Empty;
        public Guid CustomerUserId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public Guid PharmacyId { get; set; }
        public string PharmacyName { get; set; } = string.Empty;
        public string PharmacyAddress { get; set; } = string.Empty;
        public string PharmacyPhone { get; set; } = string.Empty;
        public Guid PharmacyInventoryId { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public string Strength { get; set; } = string.Empty;
        public int QuantityRequested { get; set; }
        public decimal TotalEstimatedPrice { get; set; }
        public string Status { get; set; } = string.Empty;
        public string RejectionReason { get; set; } = string.Empty;
        public string CustomerNote { get; set; } = string.Empty;
        public DateTime RequestedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public bool IsExpired => Status == "Approved" && ExpiresAt.HasValue && ExpiresAt.Value < DateTime.UtcNow;
    }
}
