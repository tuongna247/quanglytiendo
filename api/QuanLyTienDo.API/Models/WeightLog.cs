namespace QuanLyTienDo.API.Models;

public class WeightLog
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Date { get; set; } = string.Empty;
    public decimal WeightKg { get; set; }
    public decimal? BodyFatPct { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }

    public User User { get; set; } = null!;
}
