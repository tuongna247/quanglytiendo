namespace QuanLyTienDo.API.Models;

public class EbookHighlight
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid BookId { get; set; }
    public int PageNumber { get; set; }
    public int StartOffset { get; set; }
    public int EndOffset { get; set; }
    public string Text { get; set; } = string.Empty;
    public string Color { get; set; } = "yellow";
    public DateTime CreatedAt { get; set; }
    public EbookBook Book { get; set; } = null!;
}
