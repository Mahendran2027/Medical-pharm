using MedicineAvailability.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace MedicineAvailability.Api.Data
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            if (!await context.Users.AnyAsync(u => u.Role == UserRole.Admin))
            {
                var adminUser = new User
                {
                    FirstName = "System",
                    LastName = "Admin",
                    Email = "admin@pharmacy.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                    PhoneNumber = "+18005550199",
                    Role = UserRole.Admin,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                await context.Users.AddAsync(adminUser);
                await context.SaveChangesAsync();
            }

            if (!await context.MedicineCategories.AnyAsync())
            {
                var categories = new List<MedicineCategory>
                {
                    new MedicineCategory { Name = "Antibiotics", Description = "Medications that fight bacterial infections.", IsActive = true, CreatedAt = DateTime.UtcNow },
                    new MedicineCategory { Name = "Pain Relievers", Description = "Analgesics and pain management drugs.", IsActive = true, CreatedAt = DateTime.UtcNow },
                    new MedicineCategory { Name = "Cardiovascular", Description = "Medications for heart and blood pressure conditions.", IsActive = true, CreatedAt = DateTime.UtcNow },
                    new MedicineCategory { Name = "Respiratory", Description = "Asthma, allergy, and lung treatment medications.", IsActive = true, CreatedAt = DateTime.UtcNow },
                    new MedicineCategory { Name = "Diabetes Care", Description = "Insulin and oral antidiabetic agents.", IsActive = true, CreatedAt = DateTime.UtcNow }
                };

                await context.MedicineCategories.AddRangeAsync(categories);
                await context.SaveChangesAsync();

                var abx = categories.First(c => c.Name == "Antibiotics");
                var pain = categories.First(c => c.Name == "Pain Relievers");
                var cardio = categories.First(c => c.Name == "Cardiovascular");

                var sampleMedicines = new List<Medicine>
                {
                    new Medicine
                    {
                        CategoryId = abx.Id,
                        Name = "Amoxicillin 500mg Capsule",
                        GenericName = "Amoxicillin",
                        BrandName = "Amoxil",
                        Manufacturer = "Novartis",
                        DosageForm = "Capsule",
                        Strength = "500mg",
                        Description = "Broad-spectrum penicillin antibiotic used for bacterial infections.",
                        RequiresPrescription = true,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Medicine
                    {
                        CategoryId = pain.Id,
                        Name = "Paracetamol 500mg Tablet",
                        GenericName = "Acetaminophen",
                        BrandName = "Panadol",
                        Manufacturer = "GSK",
                        DosageForm = "Tablet",
                        Strength = "500mg",
                        Description = "Pain reliever and fever reducer.",
                        RequiresPrescription = false,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    },
                    new Medicine
                    {
                        CategoryId = cardio.Id,
                        Name = "Amlodipine 5mg Tablet",
                        GenericName = "Amlodipine Besylate",
                        BrandName = "Norvasc",
                        Manufacturer = "Pfizer",
                        DosageForm = "Tablet",
                        Strength = "5mg",
                        Description = "Calcium channel blocker used to treat high blood pressure.",
                        RequiresPrescription = true,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    }
                };

                await context.Medicines.AddRangeAsync(sampleMedicines);
                await context.SaveChangesAsync();
            }
        }
    }
}
