using MedicineAvailability.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MedicineAvailability.Api.Data.EntityConfigurations
{
    public class PharmacyStockRequestConfiguration : IEntityTypeConfiguration<PharmacyStockRequest>
    {
        public void Configure(EntityTypeBuilder<PharmacyStockRequest> builder)
        {
            builder.ToTable("PharmacyStockRequests");

            builder.HasKey(psr => psr.Id);

            builder.Property(psr => psr.RequestNumber)
                .IsRequired()
                .HasMaxLength(50);

            builder.HasIndex(psr => psr.RequestNumber)
                .IsUnique();

            builder.HasOne(psr => psr.RequestingPharmacy)
                .WithMany(p => p.OutgoingStockRequests)
                .HasForeignKey(psr => psr.RequestingPharmacyId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(psr => psr.FulfillingPharmacy)
                .WithMany(p => p.IncomingStockRequests)
                .HasForeignKey(psr => psr.FulfillingPharmacyId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
