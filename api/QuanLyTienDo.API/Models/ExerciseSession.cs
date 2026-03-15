namespace QuanLyTienDo.API.Models;

public class ExerciseSession
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Date { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // cardio/strength/flexibility/sports/other
    public string Name { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public int? CaloriesBurned { get; set; }
    public string Intensity { get; set; } = string.Empty; // light/moderate/vigorous
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
}
