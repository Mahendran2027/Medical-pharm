using MedicineAvailability.Api.DTOs.Common;
using MedicineAvailability.Api.DTOs.Users;

namespace MedicineAvailability.Api.Services.Interfaces
{
    public interface IUserService
    {
        Task<ApiResponse<UserResponseDto>> GetUserProfileAsync(Guid userId);
        Task<ApiResponse<UserResponseDto>> UpdateUserProfileAsync(Guid userId, UpdateUserDto dto);
        Task<ApiResponse<PagedResponse<UserResponseDto>>> GetUsersAsync(int page = 1, int pageSize = 10, string? role = null);
        Task<ApiResponse<UserResponseDto>> GetUserByIdAsync(Guid userId);
    }
}
