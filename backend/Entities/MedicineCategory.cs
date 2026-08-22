namespace MedicineAvailability.Api.Entities
{
    public class MedicineCategory
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual ICollection<Medicine> Medicines { get; set; } = new List<Medicine>();
    }
}
