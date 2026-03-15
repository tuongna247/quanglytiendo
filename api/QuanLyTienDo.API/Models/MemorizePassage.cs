namespace QuanLyTienDo.API.Models;

public class MemorizePassage
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Reference { get; set; } = string.Empty; // e.g. "Giăng 3:16"
    public string ParsedJson { get; set; } = "{}";        // parsed object JSON
    public string MasteredJson { get; set; } = "[]";      // bool[] JSON
    public DateTime AddedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
}
