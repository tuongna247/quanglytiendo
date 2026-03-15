namespace QuanLyTienDo.API.Models;

public class BibleReadingDay
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid PlanId { get; set; }
    public int DayNumber { get; set; }
    public string ScheduledDate { get; set; } = string.Empty;
    public string Readings { get; set; } = "[]"; // JSON
    public bool IsCompleted { get; set; }
    public DateTime? CompletedAt { get; set; }
    public Guid? LinkedDevotionId { get; set; }

    public BibleReadingPlan Plan { get; set; } = null!;
}
