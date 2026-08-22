using MedicineAvailability.Api.DTOs.Analytics;
using MedicineAvailability.Api.DTOs.Common;

namespace MedicineAvailability.Api.Services.Interfaces
{
    public interface IAnalyticsService
    {
        Task<ApiResponse<PharmacyAnalyticsResponseDto>> GetPharmacyAnalyticsAsync(Guid pharmacyId);
        Task<ApiResponse<AdminAnalyticsResponseDto>> GetAdminAnalyticsAsync();
    }
}
