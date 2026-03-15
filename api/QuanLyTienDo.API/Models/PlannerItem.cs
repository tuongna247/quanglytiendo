namespace QuanLyTienDo.API.Models;

public class PlannerItem
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Date { get; set; } = string.Empty; // yyyy-MM-dd
    public int Order { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public bool IsDone { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int? EstimatedMinutes { get; set; }
    public Guid? LinkedTaskId { get; set; }
    public Guid? LinkedEventId { get; set; }
    public string Priority { get; set; } = "medium";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
}
