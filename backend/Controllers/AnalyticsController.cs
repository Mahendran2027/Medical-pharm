using System.Security.Claims;
using MedicineAvailability.Api.Data;
using MedicineAvailability.Api.DTOs.Analytics;
using MedicineAvailability.Api.DTOs.Common;
using MedicineAvailability.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedicineAvailability.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;
        private readonly ApplicationDbContext _dbContext;

        public AnalyticsController(IAnalyticsService analyticsService, ApplicationDbContext dbContext)
        {
            _analyticsService = analyticsService;
            _dbContext = dbContext;
        }

        [HttpGet("pharmacy")]
        [Authorize(Roles = "Pharmacy")]
        public async Task<IActionResult> GetPharmacyAnalytics()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized();
            }

            var pharmacy = await _dbContext.Pharmacies.FirstOrDefaultAsync(p => p.UserId == userId);
            if (pharmacy == null)
            {
                return BadRequest(ApiResponse<string>.Fail("Pharmacy account not found."));
            }

            var result = await _analyticsService.GetPharmacyAnalyticsAsync(pharmacy.Id);
            return Ok(result);
        }

        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminAnalytics()
        {
            var result = await _analyticsService.GetAdminAnalyticsAsync();
            return Ok(result);
        }
    }
}
