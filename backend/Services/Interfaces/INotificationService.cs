using MedicineAvailability.Api.DTOs.Common;
using MedicineAvailability.Api.DTOs.Notifications;

namespace MedicineAvailability.Api.Services.Interfaces
{
    public interface INotificationService
    {
        Task<ApiResponse<PagedResponse<NotificationResponseDto>>> GetUserNotificationsAsync(Guid userId, int page = 1, int pageSize = 15, bool? unreadOnly = null);
        Task<ApiResponse<bool>> MarkAsReadAsync(Guid notificationId, Guid userId);
        Task<ApiResponse<bool>> MarkAllAsReadAsync(Guid userId);
    }
}
