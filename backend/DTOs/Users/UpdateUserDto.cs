using System.ComponentModel.DataAnnotations;

namespace MedicineAvailability.Api.DTOs.Users
{
    public class UpdateUserDto
    {
        [Required]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        public string LastName { get; set; } = string.Empty;

        [Phone]
        public string PhoneNumber { get; set; } = string.Empty;
    }
}
