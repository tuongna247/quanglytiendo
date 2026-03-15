namespace QuanLyTienDo.API.DTOs;

public class WeightLogDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Date { get; set; } = string.Empty;
    public decimal WeightKg { get; set; }
    public decimal? BodyFatPct { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateWeightLogRequest
{
    public string Date { get; set; } = string.Empty;
    public decimal WeightKg { get; set; }
    public decimal? BodyFatPct { get; set; }
    public string? Notes { get; set; }
}

public class ExerciseSessionDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Date { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public int? CaloriesBurned { get; set; }
    public string Intensity { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateExerciseSessionRequest
{
    public string Date { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public int? CaloriesBurned { get; set; }
    public string Intensity { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class HealthGoalDto
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
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class SaveHealthGoalRequest
{
    public string StartDate { get; set; } = string.Empty;
    public string? TargetDate { get; set; }
    public decimal StartWeightKg { get; set; }
    public decimal TargetWeightKg { get; set; }
    public decimal HeightCm { get; set; }
    public int? DailyCalorieTarget { get; set; }
    public int? WeeklyExerciseDays { get; set; }
}

public class BodyCheckInDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Date { get; set; } = string.Empty;
    public int EnergyLevel { get; set; }
    public int MoodLevel { get; set; }
    public int SleepQuality { get; set; }
    public decimal? SleepHours { get; set; }
    public bool MuscleSoreness { get; set; }
    public string? SoreAreas { get; set; }
    public string? PainNotes { get; set; }
    public int StressLevel { get; set; }
    public string? GeneralNotes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class SaveBodyCheckInRequest
{
    public string Date { get; set; } = string.Empty;
    public int EnergyLevel { get; set; }
    public int MoodLevel { get; set; }
    public int SleepQuality { get; set; }
    public decimal? SleepHours { get; set; }
    public bool MuscleSoreness { get; set; }
    public string? SoreAreas { get; set; }
    public string? PainNotes { get; set; }
    public int StressLevel { get; set; }
    public string? GeneralNotes { get; set; }
}
