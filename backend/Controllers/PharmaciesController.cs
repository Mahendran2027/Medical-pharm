using System.Security.Claims;
using MedicineAvailability.Api.DTOs.Common;
using MedicineAvailability.Api.DTOs.Pharmacies;
using MedicineAvailability.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicineAvailability.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PharmaciesController : ControllerBase
    {
        private readonly IPharmacyService _pharmacyService;

        public PharmaciesController(IPharmacyService pharmacyService)
        {
            _pharmacyService = pharmacyService;
        }

        [HttpGet]
        public async Task<IActionResult> GetApprovedPharmacies([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? city = null, [FromQuery] string? search = null)
        {
            var result = await _pharmacyService.GetApprovedPharmaciesAsync(page, pageSize, city, search);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetPharmacyById(Guid id)
        {
            var result = await _pharmacyService.GetPharmacyByIdAsync(id);
            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        [HttpGet("me")]
        [Authorize(Roles = "Pharmacy")]
        public async Task<IActionResult> GetMyPharmacyProfile()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized();
            }

            var result = await _pharmacyService.GetPharmacyByUserIdAsync(userId);
            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        [HttpPut("me")]
        [Authorize(Roles = "Pharmacy")]
        public async Task<IActionResult> UpdateMyPharmacyProfile([FromBody] UpdatePharmacyDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<PharmacyResponseDto>.Fail("Invalid update request payload."));
            }

            var result = await _pharmacyService.UpdatePharmacyProfileAsync(userId, dto);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
    }

    [ApiController]
    [Route("api/admin/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminPharmaciesController : ControllerBase
    {
        private readonly IPharmacyService _pharmacyService;

        public AdminPharmaciesController(IPharmacyService pharmacyService)
        {
            _pharmacyService = pharmacyService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPharmacies([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] bool? isApproved = null)
        {
            var result = await _pharmacyService.GetAllPharmaciesForAdminAsync(page, pageSize, isApproved);
            return Ok(result);
        }

        [HttpPut("{id:guid}/approve")]
        public async Task<IActionResult> ApprovePharmacy(Guid id)
        {
            var result = await _pharmacyService.ApprovePharmacyAsync(id);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPut("{id:guid}/deactivate")]
        public async Task<IActionResult> DeactivatePharmacy(Guid id)
        {
            var result = await _pharmacyService.DeactivatePharmacyAsync(id);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
    }
}
