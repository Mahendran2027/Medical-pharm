using MedicineAvailability.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MedicineAvailability.Api.Data.EntityConfigurations
{
    public class ReservationConfiguration : IEntityTypeConfiguration<Reservation>
    {
        public void Configure(EntityTypeBuilder<Reservation> builder)
        {
            builder.ToTable("Reservations");

            builder.HasKey(r => r.Id);

            builder.Property(r => r.ReservationCode)
                .IsRequired()
                .HasMaxLength(50);

            builder.HasIndex(r => r.ReservationCode)
                .IsUnique();

            builder.Property(r => r.TotalEstimatedPrice)
                .HasPrecision(18, 2);

            builder.Property(r => r.Status)
                .HasConversion<int>()
                .IsRequired();

            builder.HasOne(r => r.CustomerUser)
                .WithMany(u => u.Reservations)
                .HasForeignKey(r => r.CustomerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(r => r.Pharmacy)
                .WithMany(p => p.Reservations)
                .HasForeignKey(r => r.PharmacyId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(r => r.PharmacyInventory)
                .WithMany(pi => pi.Reservations)
                .HasForeignKey(r => r.PharmacyInventoryId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
