using System.ComponentModel.DataAnnotations;
using MedicineAvailability.Api.Entities;

namespace MedicineAvailability.Api.DTOs.Inventory
{
    public class CreateInventoryDto
    {
        [Required]
        public Guid MedicineId { get; set; }

        [Required]
        [Range(0, 100000, ErrorMessage = "Quantity must be non-negative.")]
        public int QuantityOnHand { get; set; }

        [Required]
        [Range(0.01, 100000.00, ErrorMessage = "Unit price must be greater than zero.")]
        public decimal UnitPrice { get; set; }

        [Range(1, 1000, ErrorMessage = "Threshold must be at least 1.")]
        public int LowStockThreshold { get; set; } = 10;

        public string BatchNumber { get; set; } = string.Empty;
        public DateTime? ExpiryDate { get; set; }
    }

    public class UpdateInventoryDto
    {
        [Required]
        [Range(0, 100000, ErrorMessage = "Quantity must be non-negative.")]
        public int QuantityOnHand { get; set; }

        [Required]
        [Range(0.01, 100000.00, ErrorMessage = "Unit price must be greater than zero.")]
        public decimal UnitPrice { get; set; }

        [Range(1, 1000, ErrorMessage = "Threshold must be at least 1.")]
        public int LowStockThreshold { get; set; } = 10;

        public string BatchNumber { get; set; } = string.Empty;
        public DateTime? ExpiryDate { get; set; }
        public bool IsActive { get; set; } = true;
        public string AdjustmentNote { get; set; } = "Manual inventory update";
    }

    public class InventoryResponseDto
    {
        public Guid Id { get; set; }
        public Guid PharmacyId { get; set; }
        public string PharmacyName { get; set; } = string.Empty;
        public Guid MedicineId { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public string GenericName { get; set; } = string.Empty;
        public string Strength { get; set; } = string.Empty;
        public string DosageForm { get; set; } = string.Empty;
        public int QuantityOnHand { get; set; }
        public int ReservedQuantity { get; set; }
        public int AvailableQuantity { get; set; }
        public decimal UnitPrice { get; set; }
        public int LowStockThreshold { get; set; }
        public bool IsLowStock => AvailableQuantity <= LowStockThreshold;
        public string BatchNumber { get; set; } = string.Empty;
        public DateTime? ExpiryDate { get; set; }
        public bool IsActive { get; set; }
        public DateTime LastStockUpdate { get; set; }
    }

    public class InventoryTransactionResponseDto
    {
        public Guid Id { get; set; }
        public Guid PharmacyInventoryId { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public string TransactionType { get; set; } = string.Empty;
        public int QuantityChange { get; set; }
        public int NewQuantityOnHand { get; set; }
        public int NewReservedQuantity { get; set; }
        public string ReferenceNumber { get; set; } = string.Empty;
        public string Note { get; set; } = string.Empty;
        public string PerformedByUserName { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }
}
