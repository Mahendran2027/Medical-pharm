using MedicineAvailability.Api.DTOs.Auth;
using MedicineAvailability.Api.DTOs.Common;

namespace MedicineAvailability.Api.Services.Interfaces
{
    public interface IAuthService
    {
        Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterRequestDto request);
        Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginRequestDto request);
    }
}
