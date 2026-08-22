using MedicineAvailability.Api.DTOs.Common;
using MedicineAvailability.Api.DTOs.Reservations;

namespace MedicineAvailability.Api.Services.Interfaces
{
    public interface IReservationService
    {
        Task<ApiResponse<ReservationResponseDto>> CreateReservationAsync(Guid customerUserId, CreateReservationDto dto);
        Task<ApiResponse<PagedResponse<ReservationResponseDto>>> GetCustomerReservationsAsync(Guid customerUserId, int page = 1, int pageSize = 10);
        Task<ApiResponse<PagedResponse<ReservationResponseDto>>> GetPharmacyReservationsAsync(Guid pharmacyId, int page = 1, int pageSize = 10, string? status = null);
        Task<ApiResponse<ReservationResponseDto>> ApproveReservationAsync(Guid reservationId, Guid pharmacyId, Guid userId, int expiryHours = 24);
        Task<ApiResponse<ReservationResponseDto>> RejectReservationAsync(Guid reservationId, Guid pharmacyId, Guid userId, string reason);
        Task<ApiResponse<ReservationResponseDto>> CancelReservationAsync(Guid reservationId, Guid currentUserId, string userRole);
        Task<ApiResponse<ReservationResponseDto>> FulfillReservationAsync(Guid reservationId, Guid pharmacyId, Guid userId);
        Task CleanupExpiredReservationsAsync();
    }
}
