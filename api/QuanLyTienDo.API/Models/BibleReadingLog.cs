namespace QuanLyTienDo.API.Models;

public class BibleReadingLog
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Date { get; set; } = string.Empty; // "YYYY-MM-DD"
    public DateTime CreatedAt { get; set; }

    public User User { get; set; } = null!;
}
