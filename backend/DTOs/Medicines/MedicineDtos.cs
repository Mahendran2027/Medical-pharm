using System.ComponentModel.DataAnnotations;

namespace MedicineAvailability.Api.DTOs.Medicines
{
    public class CreateMedicineDto
    {
        [Required]
        public Guid CategoryId { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        public string GenericName { get; set; } = string.Empty;
        public string BrandName { get; set; } = string.Empty;
        public string Manufacturer { get; set; } = string.Empty;
        
        [Required]
        public string DosageForm { get; set; } = string.Empty;
        
        [Required]
        public string Strength { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;
        public bool RequiresPrescription { get; set; } = false;
    }

    public class UpdateMedicineDto
    {
        [Required]
        public Guid CategoryId { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        public string GenericName { get; set; } = string.Empty;
        public string BrandName { get; set; } = string.Empty;
        public string Manufacturer { get; set; } = string.Empty;
        
        [Required]
        public string DosageForm { get; set; } = string.Empty;

        [Required]
        public string Strength { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;
        public bool RequiresPrescription { get; set; } = false;
        public bool IsActive { get; set; } = true;
    }

    public class MedicineResponseDto
    {
        public Guid Id { get; set; }
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string GenericName { get; set; } = string.Empty;
        public string BrandName { get; set; } = string.Empty;
        public string Manufacturer { get; set; } = string.Empty;
        public string DosageForm { get; set; } = string.Empty;
        public string Strength { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool RequiresPrescription { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class MedicineSearchResponseDto
    {
        public Guid MedicineId { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public string GenericName { get; set; } = string.Empty;
        public string BrandName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string DosageForm { get; set; } = string.Empty;
        public string Strength { get; set; } = string.Empty;
        public bool RequiresPrescription { get; set; }
        public List<PharmacyStockAvailabilityDto> AvailablePharmacies { get; set; } = new List<PharmacyStockAvailabilityDto>();
    }

    public class PharmacyStockAvailabilityDto
    {
        public Guid PharmacyInventoryId { get; set; }
        public Guid PharmacyId { get; set; }
        public string PharmacyName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string ContactPhone { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int AvailableQuantity { get; set; }
        public decimal UnitPrice { get; set; }
        public DateTime LastStockUpdate { get; set; }
        public bool IsLowStock { get; set; }
    }
}
