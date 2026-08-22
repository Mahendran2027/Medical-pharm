namespace MedicineAvailability.Api.Entities
{
    public class SearchHistory
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid? UserId { get; set; }
        public string SearchTerm { get; set; } = string.Empty;
        public string LocationFilter { get; set; } = string.Empty;
        public int ResultsCount { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual User? User { get; set; }
    }
}
