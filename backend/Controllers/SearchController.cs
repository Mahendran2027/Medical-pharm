using System.Security.Claims;
using MedicineAvailability.Api.DTOs.Common;
using MedicineAvailability.Api.DTOs.Medicines;
using MedicineAvailability.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MedicineAvailability.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SearchController : ControllerBase
    {
        private readonly IMedicineService _medicineService;

        public SearchController(IMedicineService medicineService)
        {
            _medicineService = medicineService;
        }

        [HttpGet("medicines")]
        public async Task<IActionResult> SearchMedicines([FromQuery] string query, [FromQuery] string? city = null)
        {
            Guid? userId = null;
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(userIdStr, out var parsedId))
            {
                userId = parsedId;
            }

            var result = await _medicineService.SearchMedicinesWithStockAsync(query ?? "", city, userId);
            return Ok(result);
        }
    }
}
