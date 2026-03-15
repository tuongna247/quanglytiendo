namespace QuanLyTienDo.API.Models;

public class DailyNote
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Date { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string TodoItems { get; set; } = "[]"; // JSON
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
}
