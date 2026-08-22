using MedicineAvailability.Api.Data;
using MedicineAvailability.Api.DTOs.Common;
using MedicineAvailability.Api.DTOs.Notifications;
using MedicineAvailability.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MedicineAvailability.Api.Services
{
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _dbContext;

        public NotificationService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<ApiResponse<PagedResponse<NotificationResponseDto>>> GetUserNotificationsAsync(Guid userId, int page = 1, int pageSize = 15, bool? unreadOnly = null)
        {
            var query = _dbContext.Notifications
                .Where(n => n.UserId == userId)
                .AsQueryable();

            if (unreadOnly.HasValue && unreadOnly.Value)
            {
                query = query.Where(n => !n.IsRead);
            }

            int totalCount = await query.CountAsync();
            var notifications = await query
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = notifications.Select(n => new NotificationResponseDto
            {
                Id = n.Id,
                UserId = n.UserId,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type.ToString(),
                IsRead = n.IsRead,
                TargetUrl = n.TargetUrl,
                CreatedAt = n.CreatedAt
            }).ToList();

            var paged = new PagedResponse<NotificationResponseDto>(dtos, totalCount, page, pageSize);
            return ApiResponse<PagedResponse<NotificationResponseDto>>.Ok(paged);
        }

        public async Task<ApiResponse<bool>> MarkAsReadAsync(Guid notificationId, Guid userId)
        {
            var notif = await _dbContext.Notifications.FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);
            if (notif == null)
            {
                return ApiResponse<bool>.Fail("Notification not found.");
            }

            notif.IsRead = true;
            await _dbContext.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Notification marked as read.");
        }

        public async Task<ApiResponse<bool>> MarkAllAsReadAsync(Guid userId)
        {
            var unread = await _dbContext.Notifications.Where(n => n.UserId == userId && !n.IsRead).ToListAsync();
            foreach (var n in unread)
            {
                n.IsRead = true;
            }

            await _dbContext.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "All notifications marked as read.");
        }
    }
}
