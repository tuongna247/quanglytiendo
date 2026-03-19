namespace QuanLyTienDo.API.Models;

public class UserShareSettings
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public bool ShareTasks { get; set; } = false;
    public bool SharePlanner { get; set; } = false;
    public bool ShareFinanceSummary { get; set; } = false;
    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
}
