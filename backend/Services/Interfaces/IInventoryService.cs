using MedicineAvailability.Api.DTOs.Common;
using MedicineAvailability.Api.DTOs.Inventory;

namespace MedicineAvailability.Api.Services.Interfaces
{
    public interface IInventoryService
    {
        Task<ApiResponse<PagedResponse<InventoryResponseDto>>> GetPharmacyInventoryAsync(Guid pharmacyId, int page = 1, int pageSize = 10, string? search = null, bool? isLowStock = null);
        Task<ApiResponse<InventoryResponseDto>> AddInventoryAsync(Guid pharmacyId, Guid userId, CreateInventoryDto dto);
        Task<ApiResponse<InventoryResponseDto>> UpdateInventoryAsync(Guid inventoryId, Guid pharmacyId, Guid userId, UpdateInventoryDto dto);
        Task<ApiResponse<bool>> DeleteInventoryAsync(Guid inventoryId, Guid pharmacyId, Guid userId);
        Task<ApiResponse<List<InventoryResponseDto>>> GetLowStockAlertsAsync(Guid pharmacyId);
        Task<ApiResponse<PagedResponse<InventoryTransactionResponseDto>>> GetInventoryHistoryAsync(Guid pharmacyId, int page = 1, int pageSize = 10);
    }
}
