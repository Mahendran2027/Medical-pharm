using System.Security.Claims;
using MedicineAvailability.Api.Data;
using MedicineAvailability.Api.DTOs.Common;
using MedicineAvailability.Api.DTOs.Inventory;
using MedicineAvailability.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedicineAvailability.Api.Controllers
{
    [ApiController]
    [Route("api/pharmacies/me/inventory")]
    [Authorize(Roles = "Pharmacy")]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;
        private readonly ApplicationDbContext _dbContext;

        public InventoryController(IInventoryService inventoryService, ApplicationDbContext dbContext)
        {
            _inventoryService = inventoryService;
            _dbContext = dbContext;
        }

        private async Task<(Guid UserId, Guid PharmacyId)?> GetCurrentPharmacyUserAsync()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
            {
                return null;
            }

            var pharmacy = await _dbContext.Pharmacies.FirstOrDefaultAsync(p => p.UserId == userId);
            if (pharmacy == null)
            {
                return null;
            }

            return (userId, pharmacy.Id);
        }

        [HttpGet]
        public async Task<IActionResult> GetMyInventory([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null, [FromQuery] bool? isLowStock = null)
        {
            var auth = await GetCurrentPharmacyUserAsync();
            if (!auth.HasValue)
            {
                return Unauthorized(ApiResponse<string>.Fail("Pharmacy account not associated with user."));
            }

            var result = await _inventoryService.GetPharmacyInventoryAsync(auth.Value.PharmacyId, page, pageSize, search, isLowStock);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> AddInventory([FromBody] CreateInventoryDto dto)
        {
            var auth = await GetCurrentPharmacyUserAsync();
            if (!auth.HasValue)
            {
                return Unauthorized(ApiResponse<string>.Fail("Pharmacy account not associated with user."));
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<InventoryResponseDto>.Fail("Invalid submission parameters."));
            }

            var result = await _inventoryService.AddInventoryAsync(auth.Value.PharmacyId, auth.Value.UserId, dto);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateInventory(Guid id, [FromBody] UpdateInventoryDto dto)
        {
            var auth = await GetCurrentPharmacyUserAsync();
            if (!auth.HasValue)
            {
                return Unauthorized(ApiResponse<string>.Fail("Pharmacy account not associated with user."));
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<InventoryResponseDto>.Fail("Invalid update parameters."));
            }

            var result = await _inventoryService.UpdateInventoryAsync(id, auth.Value.PharmacyId, auth.Value.UserId, dto);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteInventory(Guid id)
        {
            var auth = await GetCurrentPharmacyUserAsync();
            if (!auth.HasValue)
            {
                return Unauthorized(ApiResponse<string>.Fail("Pharmacy account not associated with user."));
            }

            var result = await _inventoryService.DeleteInventoryAsync(id, auth.Value.PharmacyId, auth.Value.UserId);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpGet("low-stock")]
        public async Task<IActionResult> GetLowStockAlerts()
        {
            var auth = await GetCurrentPharmacyUserAsync();
            if (!auth.HasValue)
            {
                return Unauthorized(ApiResponse<string>.Fail("Pharmacy account not associated with user."));
            }

            var result = await _inventoryService.GetLowStockAlertsAsync(auth.Value.PharmacyId);
            return Ok(result);
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetInventoryHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var auth = await GetCurrentPharmacyUserAsync();
            if (!auth.HasValue)
            {
                return Unauthorized(ApiResponse<string>.Fail("Pharmacy account not associated with user."));
            }

            var result = await _inventoryService.GetInventoryHistoryAsync(auth.Value.PharmacyId, page, pageSize);
            return Ok(result);
        }
    }
}
