namespace QuanLyTienDo.API.Models;

public class UserBiblePlanConfig
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Type { get; set; } = "option1";        // "option1" | "option2"
    public string Duration { get; set; } = "1y";          // "3m"|"6m"|"9m"|"1y"|"2y"
    public string StartDate { get; set; } = string.Empty;
    public int? StartWeekOverride { get; set; }
    public string? GeneratedPlanJson { get; set; }        // JSON weeks array (can be large)
    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
}
