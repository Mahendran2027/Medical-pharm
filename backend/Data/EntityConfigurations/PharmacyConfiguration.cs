using MedicineAvailability.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MedicineAvailability.Api.Data.EntityConfigurations
{
    public class PharmacyConfiguration : IEntityTypeConfiguration<Pharmacy>
    {
        public void Configure(EntityTypeBuilder<Pharmacy> builder)
        {
            builder.ToTable("Pharmacies");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.Name)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(p => p.LicenseNumber)
                .IsRequired()
                .HasMaxLength(100);

            builder.HasIndex(p => p.LicenseNumber)
                .IsUnique();

            builder.Property(p => p.Address)
                .IsRequired()
                .HasMaxLength(300);

            builder.Property(p => p.City)
                .IsRequired()
                .HasMaxLength(100);

            builder.HasIndex(p => p.City);

            builder.Property(p => p.State)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(p => p.ZipCode)
                .HasMaxLength(20);

            builder.HasOne(p => p.User)
                .WithOne(u => u.Pharmacy)
                .HasForeignKey<Pharmacy>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
