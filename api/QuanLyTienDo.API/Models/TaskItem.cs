namespace QuanLyTienDo.API.Models;

public class TaskItem
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = "todo"; // todo/in-progress/done/cancelled
    public string Priority { get; set; } = "medium"; // low/medium/high/urgent
    public string Category { get; set; } = "general";
    public string? DueDate { get; set; } // date string yyyy-MM-dd
    public string Steps { get; set; } = "[]"; // JSON array of steps
    public string Tags { get; set; } = "[]"; // JSON array
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
}
