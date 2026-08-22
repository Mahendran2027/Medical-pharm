using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MedicineAvailability.Api.Data;
using MedicineAvailability.Api.DTOs.Auth;
using MedicineAvailability.Api.DTOs.Common;
using MedicineAvailability.Api.DTOs.Users;
using MedicineAvailability.Api.Entities;
using MedicineAvailability.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace MedicineAvailability.Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext dbContext, IConfiguration configuration)
        {
            _dbContext = dbContext;
            _configuration = configuration;
        }

        public async Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterRequestDto request)
        {
            if (request.Role == UserRole.Admin)
            {
                return ApiResponse<AuthResponseDto>.Fail("Public registration for Admin role is strictly forbidden.");
            }

            var existingUser = await _dbContext.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower());
            if (existingUser)
            {
                return ApiResponse<AuthResponseDto>.Fail("A user with this email address already exists.");
            }

            if (request.Role == UserRole.Pharmacy && request.PharmacyDetails == null)
            {
                return ApiResponse<AuthResponseDto>.Fail("Pharmacy details are required when registering a pharmacy account.");
            }

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                Email = request.Email.ToLower().Trim(),
                PasswordHash = passwordHash,
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                PhoneNumber = request.PhoneNumber?.Trim() ?? string.Empty,
                Role = request.Role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await _dbContext.Users.AddAsync(user);

            Pharmacy? pharmacy = null;
            if (request.Role == UserRole.Pharmacy && request.PharmacyDetails != null)
            {
                var existingLicense = await _dbContext.Pharmacies.AnyAsync(p => p.LicenseNumber == request.PharmacyDetails.LicenseNumber);
                if (existingLicense)
                {
                    return ApiResponse<AuthResponseDto>.Fail("A pharmacy with this license number is already registered.");
                }

                pharmacy = new Pharmacy
                {
                    UserId = user.Id,
                    Name = request.PharmacyDetails.Name.Trim(),
                    LicenseNumber = request.PharmacyDetails.LicenseNumber.Trim(),
                    Address = request.PharmacyDetails.Address.Trim(),
                    City = request.PharmacyDetails.City.Trim(),
                    State = request.PharmacyDetails.State.Trim(),
                    ZipCode = request.PharmacyDetails.ZipCode?.Trim() ?? string.Empty,
                    Latitude = request.PharmacyDetails.Latitude,
                    Longitude = request.PharmacyDetails.Longitude,
                    ContactPhone = request.PharmacyDetails.ContactPhone.Trim(),
                    ContactEmail = string.IsNullOrEmpty(request.PharmacyDetails.ContactEmail) ? user.Email : request.PharmacyDetails.ContactEmail.Trim(),
                    OperatingHours = request.PharmacyDetails.OperatingHours?.Trim() ?? "9:00 AM - 9:00 PM",
                    IsApproved = false, // Pharmacies require admin approval
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                await _dbContext.Pharmacies.AddAsync(pharmacy);
            }

            await _dbContext.SaveChangesAsync();

            var token = GenerateJwtToken(user, pharmacy?.Id);
            var expiry = DateTime.UtcNow.AddDays(7);

            var userDto = new UserResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role.ToString(),
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                PharmacyId = pharmacy?.Id,
                PharmacyName = pharmacy?.Name,
                PharmacyApproved = pharmacy?.IsApproved
            };

            return ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
            {
                Token = token,
                ExpiresAt = expiry,
                User = userDto
            }, "Registration successful.");
        }

        public async Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginRequestDto request)
        {
            var user = await _dbContext.Users
                .Include(u => u.Pharmacy)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return ApiResponse<AuthResponseDto>.Fail("Invalid email or password.");
            }

            if (!user.IsActive)
            {
                return ApiResponse<AuthResponseDto>.Fail("Your account has been deactivated. Please contact support.");
            }

            var token = GenerateJwtToken(user, user.Pharmacy?.Id);
            var expiry = DateTime.UtcNow.AddDays(7);

            var userDto = new UserResponseDto
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

            return ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
            {
                Token = token,
                ExpiresAt = expiry,
                User = userDto
            }, "Login successful.");
        }

        private string GenerateJwtToken(User user, Guid? pharmacyId)
        {
            var secretKey = _configuration["Jwt:SecretKey"] ?? "SUPER_SECRET_DEF_KEY_123456789_PHARMA_SYSTEM_2026";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("FirstName", user.FirstName),
                new Claim("LastName", user.LastName)
            };

            if (pharmacyId.HasValue)
            {
                claims.Add(new Claim("PharmacyId", pharmacyId.Value.ToString()));
            }

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"] ?? "PharmacyApi",
                audience: _configuration["Jwt:Audience"] ?? "PharmacyApp",
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
