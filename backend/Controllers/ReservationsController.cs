using System.Security.Claims;
using MedicineAvailability.Api.Data;
using MedicineAvailability.Api.DTOs.Common;
using MedicineAvailability.Api.DTOs.Reservations;
using MedicineAvailability.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedicineAvailability.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReservationsController : ControllerBase
    {
        private readonly IReservationService _reservationService;
        private readonly ApplicationDbContext _dbContext;

        public ReservationsController(IReservationService reservationService, ApplicationDbContext dbContext)
        {
            _reservationService = reservationService;
            _dbContext = dbContext;
        }

        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CreateReservation([FromBody] CreateReservationDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<ReservationResponseDto>.Fail("Invalid reservation request details."));
            }

            var result = await _reservationService.CreateReservationAsync(userId, dto);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpGet("my")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetMyReservations([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized();
            }

            var result = await _reservationService.GetCustomerReservationsAsync(userId, page, pageSize);
            return Ok(result);
        }

        [HttpGet("pharmacy")]
        [Authorize(Roles = "Pharmacy")]
        public async Task<IActionResult> GetPharmacyReservations([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? status = null)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized();
            }

            var pharmacy = await _dbContext.Pharmacies.FirstOrDefaultAsync(p => p.UserId == userId);
            if (pharmacy == null)
            {
                return BadRequest(ApiResponse<string>.Fail("Pharmacy account not found for current user."));
            }

            var result = await _reservationService.GetPharmacyReservationsAsync(pharmacy.Id, page, pageSize, status);
            return Ok(result);
        }

        [HttpPut("{id:guid}/approve")]
        [Authorize(Roles = "Pharmacy")]
        public async Task<IActionResult> ApproveReservation(Guid id, [FromQuery] int expiryHours = 24)
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

            var result = await _reservationService.ApproveReservationAsync(id, pharmacy.Id, userId, expiryHours);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPut("{id:guid}/reject")]
        [Authorize(Roles = "Pharmacy")]
        public async Task<IActionResult> RejectReservation(Guid id, [FromBody] UpdateReservationStatusDto dto)
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

            var result = await _reservationService.RejectReservationAsync(id, pharmacy.Id, userId, dto.ReasonOrNote);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPut("{id:guid}/cancel")]
        public async Task<IActionResult> CancelReservation(Guid id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized();
            }

            var role = User.FindFirstValue(ClaimTypes.Role) ?? "Customer";

            var result = await _reservationService.CancelReservationAsync(id, userId, role);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPut("{id:guid}/fulfill")]
        [Authorize(Roles = "Pharmacy")]
        public async Task<IActionResult> FulfillReservation(Guid id)
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

            var result = await _reservationService.FulfillReservationAsync(id, pharmacy.Id, userId);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
    }
}
