using MedicineAvailability.Api.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace MedicineAvailability.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Pharmacy> Pharmacies => Set<Pharmacy>();
        public DbSet<MedicineCategory> MedicineCategories => Set<MedicineCategory>();
        public DbSet<Medicine> Medicines => Set<Medicine>();
        public DbSet<PharmacyInventory> PharmacyInventories => Set<PharmacyInventory>();
        public DbSet<InventoryTransaction> InventoryTransactions => Set<InventoryTransaction>();
        public DbSet<Reservation> Reservations => Set<Reservation>();
        public DbSet<SearchHistory> SearchHistories => Set<SearchHistory>();
        public DbSet<Notification> Notifications => Set<Notification>();
        public DbSet<PharmacyStockRequest> PharmacyStockRequests => Set<PharmacyStockRequest>();
        public DbSet<PharmacyStockRequestItem> PharmacyStockRequestItems => Set<PharmacyStockRequestItem>();
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        }
    }
}
