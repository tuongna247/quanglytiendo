namespace QuanLyTienDo.API.DTOs;

public class WorkoutSessionDto
{
    public Guid Id { get; set; }
    public string Date { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Source { get; set; } = "manual";
    public int? DurationMinutes { get; set; }
    public int? CaloriesBurned { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<WorkoutExerciseDto> Exercises { get; set; } = [];
}

public class WorkoutExerciseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? MuscleGroup { get; set; }
    public int OrderIndex { get; set; }
    public List<WorkoutSetDto> Sets { get; set; } = [];
}

public class WorkoutSetDto
{
    public Guid Id { get; set; }
    public int SetNumber { get; set; }
    public int? Reps { get; set; }
    public decimal? WeightKg { get; set; }
    public int? DurationSeconds { get; set; }
    public int? Rpe { get; set; }
}

public class CreateWorkoutSessionRequest
{
    public string Date { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int? DurationMinutes { get; set; }
    public int? CaloriesBurned { get; set; }
    public string? Notes { get; set; }
}

public class AddExerciseRequest
{
    public string Name { get; set; } = string.Empty;
    public string? MuscleGroup { get; set; }
    public int OrderIndex { get; set; }
}

public class AddSetRequest
{
    public int SetNumber { get; set; }
    public int? Reps { get; set; }
    public decimal? WeightKg { get; set; }
    public int? DurationSeconds { get; set; }
    public int? Rpe { get; set; }
}

public class UpdateSetRequest
{
    public int? Reps { get; set; }
    public decimal? WeightKg { get; set; }
    public int? DurationSeconds { get; set; }
    public int? Rpe { get; set; }
}
