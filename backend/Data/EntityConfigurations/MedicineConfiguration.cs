using MedicineAvailability.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MedicineAvailability.Api.Data.EntityConfigurations
{
    public class MedicineConfiguration : IEntityTypeConfiguration<Medicine>
    {
        public void Configure(EntityTypeBuilder<Medicine> builder)
        {
            builder.ToTable("Medicines");

            builder.HasKey(m => m.Id);

            builder.Property(m => m.Name)
                .IsRequired()
                .HasMaxLength(200);

            builder.HasIndex(m => m.Name);

            builder.Property(m => m.GenericName)
                .HasMaxLength(200);

            builder.HasIndex(m => m.GenericName);

            builder.Property(m => m.BrandName)
                .HasMaxLength(200);

            builder.Property(m => m.Manufacturer)
                .HasMaxLength(200);

            builder.Property(m => m.DosageForm)
                .HasMaxLength(100);

            builder.Property(m => m.Strength)
                .HasMaxLength(100);

            builder.HasOne(m => m.Category)
                .WithMany(c => c.Medicines)
                .HasForeignKey(m => m.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
