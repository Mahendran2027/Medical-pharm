using MedicineAvailability.Api.DTOs.Common;
using MedicineAvailability.Api.DTOs.Medicines;
using MedicineAvailability.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicineAvailability.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicinesController : ControllerBase
    {
        private readonly IMedicineService _medicineService;

        public MedicinesController(IMedicineService medicineService)
        {
            _medicineService = medicineService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMedicines([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] Guid? categoryId = null, [FromQuery] string? search = null)
        {
            var result = await _medicineService.GetMedicinesAsync(page, pageSize, categoryId, search);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetMedicineById(Guid id)
        {
            var result = await _medicineService.GetMedicineByIdAsync(id);
            if (!result.Success)
            {
                return NotFound(result);
            }

            return Ok(result);
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var result = await _medicineService.GetCategoriesAsync();
            return Ok(result);
        }

        [HttpPost("categories")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(ApiResponse<MedicineCategoryDto>.Fail("Category name is required."));
            }

            var result = await _medicineService.CreateCategoryAsync(request.Name, request.Description ?? "");
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateMedicine([FromBody] CreateMedicineDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<MedicineResponseDto>.Fail("Invalid medicine parameters."));
            }

            var result = await _medicineService.CreateMedicineAsync(dto);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return CreatedAtAction(nameof(GetMedicineById), new { id = result.Data!.Id }, result);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateMedicine(Guid id, [FromBody] UpdateMedicineDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse<MedicineResponseDto>.Fail("Invalid update parameters."));
            }

            var result = await _medicineService.UpdateMedicineAsync(id, dto);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteMedicine(Guid id)
        {
            var result = await _medicineService.DeleteMedicineAsync(id);
            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
    }

    public class CreateCategoryRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}
