namespace QuanLyTienDo.API.Models;

public class WorkoutSet
{
    public Guid Id { get; set; }
    public Guid ExerciseId { get; set; }
    public int SetNumber { get; set; }
    public int? Reps { get; set; }
    public decimal? WeightKg { get; set; } // null = bodyweight
    public int? DurationSeconds { get; set; }
    public int? Rpe { get; set; } // 1-10

    public WorkoutExercise Exercise { get; set; } = null!;
}
