namespace QuanLyTienDo.API.Models;

public class HealthGoal
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string StartDate { get; set; } = string.Empty;
    public string? TargetDate { get; set; }
    public decimal StartWeightKg { get; set; }
    public decimal TargetWeightKg { get; set; }
    public decimal HeightCm { get; set; }
    public int? DailyCalorieTarget { get; set; }
    public int? WeeklyExerciseDays { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
}
