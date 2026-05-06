namespace QuanLyTienDo.API.DTOs;

public class WorkoutPlanDto
{
    public Guid Id { get; set; }
    public string PlanId { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public int DurationDays { get; set; }
    public string StartDate { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public List<int> CompletedDays { get; set; } = [];
    public DateTime CreatedAt { get; set; }
}

public class StartPlanRequest
{
    public string PlanId { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public int DurationDays { get; set; }
    public string StartDate { get; set; } = string.Empty;
}

public class CompleteDayRequest
{
    public int DayIndex { get; set; }
    public string SessionName { get; set; } = string.Empty;
    public int? DurationMinutes { get; set; }
    public int? CaloriesBurned { get; set; }
    public List<CompleteDayExercise> Exercises { get; set; } = [];
}

public class CompleteDayExercise
{
    public string Name { get; set; } = string.Empty;
    public string? MuscleGroup { get; set; }
    public List<CompleteDaySet> Sets { get; set; } = [];
}

public class CompleteDaySet
{
    public int SetNumber { get; set; }
    public int? Reps { get; set; }
    public decimal? WeightKg { get; set; }
    public int? DurationSeconds { get; set; }
}
