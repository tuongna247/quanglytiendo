namespace QuanLyTienDo.API.Models;

public class WorkoutExercise
{
    public Guid Id { get; set; }
    public Guid SessionId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? MuscleGroup { get; set; }
    public int OrderIndex { get; set; }

    public WorkoutSession Session { get; set; } = null!;
    public ICollection<WorkoutSet> Sets { get; set; } = new List<WorkoutSet>();
}
