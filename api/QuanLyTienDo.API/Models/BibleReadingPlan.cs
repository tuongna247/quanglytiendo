namespace QuanLyTienDo.API.Models;

public class BibleReadingPlan
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int TotalDays { get; set; }
    public string StartDate { get; set; } = string.Empty;
    public DateTime ImportedAt { get; set; }

    public User User { get; set; } = null!;
    public ICollection<BibleReadingDay> Days { get; set; } = new List<BibleReadingDay>();
}
