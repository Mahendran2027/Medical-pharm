using MedicineAvailability.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MedicineAvailability.Api.Data.EntityConfigurations
{
    public class PharmacyInventoryConfiguration : IEntityTypeConfiguration<PharmacyInventory>
    {
        public void Configure(EntityTypeBuilder<PharmacyInventory> builder)
        {
            builder.ToTable("PharmacyInventories");

            builder.HasKey(pi => pi.Id);

            builder.HasIndex(pi => new { pi.PharmacyId, pi.MedicineId })
                .IsUnique();

            builder.Property(pi => pi.UnitPrice)
                .HasPrecision(18, 2);

            builder.Property(pi => pi.RowVersion)
                .IsRowVersion();

            builder.HasOne(pi => pi.Pharmacy)
                .WithMany(p => p.Inventories)
                .HasForeignKey(pi => pi.PharmacyId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(pi => pi.Medicine)
                .WithMany(m => m.Inventories)
                .HasForeignKey(pi => pi.MedicineId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
