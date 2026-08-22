using MedicineAvailability.Api.Entities;

namespace MedicineAvailability.Api.DTOs.Users
{
    public class UserResponseDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid? PharmacyId { get; set; }
        public string? PharmacyName { get; set; }
        public bool? PharmacyApproved { get; set; }
    }
}
