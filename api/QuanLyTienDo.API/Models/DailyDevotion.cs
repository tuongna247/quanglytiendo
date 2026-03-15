namespace QuanLyTienDo.API.Models;

public class DailyDevotion
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Date { get; set; } = string.Empty;
    public string Passages { get; set; } = "[]"; // JSON
    public string BibleTeaches { get; set; } = string.Empty;
    public string LessonLearned { get; set; } = string.Empty;
    public string Application { get; set; } = string.Empty;
    public string? PrayerPoints { get; set; }
    public string? MemorizeVerse { get; set; }
    public string? GodCharacter { get; set; }
    public string? SinToAvoid { get; set; }
    public string? PromiseToClaim { get; set; }
    public string? Mood { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
}
