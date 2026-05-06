namespace QuanLyTienDo.API.Models;

public class UserWorkoutPlan
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string PlanId { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public int DurationDays { get; set; }
    public string StartDate { get; set; } = string.Empty;
    public string Status { get; set; } = "active";
    public string CompletedDaysJson { get; set; } = "[]";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
}
