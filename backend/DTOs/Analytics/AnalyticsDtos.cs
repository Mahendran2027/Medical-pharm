namespace MedicineAvailability.Api.DTOs.Analytics
{
    public class PharmacyAnalyticsResponseDto
    {
        public int TotalInventoryItems { get; set; }
        public int LowStockItemsCount { get; set; }
        public int PendingReservationsCount { get; set; }
        public int ApprovedReservationsCount { get; set; }
        public int CompletedReservationsCount { get; set; }
        public decimal TotalEstimatedValue { get; set; }
        public List<TopReservedMedicineDto> TopReservedMedicines { get; set; } = new List<TopReservedMedicineDto>();
        public List<LowStockAlertItemDto> LowStockAlerts { get; set; } = new List<LowStockAlertItemDto>();
    }

    public class AdminAnalyticsResponseDto
    {
        public int TotalUsers { get; set; }
        public int TotalCustomers { get; set; }
        public int TotalPharmacies { get; set; }
        public int PendingPharmacyApprovals { get; set; }
        public int TotalMedicinesInCatalog { get; set; }
        public int TotalInventoryListings { get; set; }
        public int TotalReservationsCreated { get; set; }
        public List<MostSearchedMedicineDto> MostSearchedMedicines { get; set; } = new List<MostSearchedMedicineDto>();
        public List<RecentActivityDto> RecentSystemActivity { get; set; } = new List<RecentActivityDto>();
    }

    public class TopReservedMedicineDto
    {
        public string MedicineName { get; set; } = string.Empty;
        public int ReservationCount { get; set; }
        public int TotalQuantityReserved { get; set; }
    }

    public class LowStockAlertItemDto
    {
        public Guid InventoryId { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public int AvailableQuantity { get; set; }
        public int LowStockThreshold { get; set; }
    }

    public class MostSearchedMedicineDto
    {
        public string SearchTerm { get; set; } = string.Empty;
        public int SearchCount { get; set; }
    }

    public class RecentActivityDto
    {
        public string ActivityType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }
}
