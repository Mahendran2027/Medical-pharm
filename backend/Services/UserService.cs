using MedicineAvailability.Api.Data;
using MedicineAvailability.Api.DTOs.Common;
using MedicineAvailability.Api.DTOs.Users;
using MedicineAvailability.Api.Entities;
using MedicineAvailability.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MedicineAvailability.Api.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _dbContext;

        public UserService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<ApiResponse<UserResponseDto>> GetUserProfileAsync(Guid userId)
        {
            var user = await _dbContext.Users
                .Include(u => u.Pharmacy)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return ApiResponse<UserResponseDto>.Fail("User profile not found.");
            }

            return ApiResponse<UserResponseDto>.Ok(MapToUserDto(user));
        }

        public async Task<ApiResponse<UserResponseDto>> UpdateUserProfileAsync(Guid userId, UpdateUserDto dto)
        {
            var user = await _dbContext.Users
                .Include(u => u.Pharmacy)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return ApiResponse<UserResponseDto>.Fail("User not found.");
            }

            user.FirstName = dto.FirstName.Trim();
            user.LastName = dto.LastName.Trim();
            user.PhoneNumber = dto.PhoneNumber?.Trim() ?? string.Empty;
            user.UpdatedAt = DateTime.UtcNow;

            await _dbContext.SaveChangesAsync();

            return ApiResponse<UserResponseDto>.Ok(MapToUserDto(user), "Profile updated successfully.");
        }

        public async Task<ApiResponse<PagedResponse<UserResponseDto>>> GetUsersAsync(int page = 1, int pageSize = 10, string? role = null)
        {
            var query = _dbContext.Users.Include(u => u.Pharmacy).AsQueryable();

            if (!string.IsNullOrEmpty(role) && Enum.TryParse<UserRole>(role, true, out var roleEnum))
            {
                query = query.Where(u => u.Role == roleEnum);
            }

            int totalCount = await query.CountAsync();
            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = users.Select(MapToUserDto).ToList();
            var pagedResponse = new PagedResponse<UserResponseDto>(dtos, totalCount, page, pageSize);

            return ApiResponse<PagedResponse<UserResponseDto>>.Ok(pagedResponse);
        }

        public async Task<ApiResponse<UserResponseDto>> GetUserByIdAsync(Guid userId)
        {
            var user = await _dbContext.Users
                .Include(u => u.Pharmacy)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return ApiResponse<UserResponseDto>.Fail("User not found.");
            }

            return ApiResponse<UserResponseDto>.Ok(MapToUserDto(user));
        }

        private static UserResponseDto MapToUserDto(User user)
        {
            return new UserResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role.ToString(),
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                PharmacyId = user.Pharmacy?.Id,
                PharmacyName = user.Pharmacy?.Name,
                PharmacyApproved = user.Pharmacy?.IsApproved
            };
        }
    }
}
