using MedicineAvailability.Api.DTOs.Common;
using MedicineAvailability.Api.DTOs.Pharmacies;

namespace MedicineAvailability.Api.Services.Interfaces
{
    public interface IPharmacyService
    {
        Task<ApiResponse<PagedResponse<PharmacyResponseDto>>> GetApprovedPharmaciesAsync(int page = 1, int pageSize = 10, string? city = null, string? search = null);
        Task<ApiResponse<PharmacyResponseDto>> GetPharmacyByIdAsync(Guid pharmacyId);
        Task<ApiResponse<PharmacyResponseDto>> GetPharmacyByUserIdAsync(Guid userId);
        Task<ApiResponse<PharmacyResponseDto>> UpdatePharmacyProfileAsync(Guid userId, UpdatePharmacyDto dto);
        Task<ApiResponse<PharmacyResponseDto>> ApprovePharmacyAsync(Guid pharmacyId);
        Task<ApiResponse<PharmacyResponseDto>> DeactivatePharmacyAsync(Guid pharmacyId);
        Task<ApiResponse<PagedResponse<PharmacyResponseDto>>> GetAllPharmaciesForAdminAsync(int page = 1, int pageSize = 10, bool? isApproved = null);
    }
}
