namespace QuanLyTienDo.API.Models;

public class BodyCheckIn
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Date { get; set; } = string.Empty;
    public int EnergyLevel { get; set; } // 1-5
    public int MoodLevel { get; set; } // 1-5
    public int SleepQuality { get; set; } // 1-5
    public decimal? SleepHours { get; set; }
    public bool MuscleSoreness { get; set; }
    public string? SoreAreas { get; set; } // JSON array
    public string? PainNotes { get; set; }
    public int StressLevel { get; set; } // 1-5
    public string? GeneralNotes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
}
