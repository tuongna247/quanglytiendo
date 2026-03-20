namespace QuanLyTienDo.API.Models;

public class BibleVerseHighlight
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string BookId { get; set; } = string.Empty;   // "gn", "ex", ...
    public int Chapter { get; set; }
    public string HighlightJson { get; set; } = "{}";    // {"1:3":"#FFF176","2:5":"#FF0000"}
    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
}
