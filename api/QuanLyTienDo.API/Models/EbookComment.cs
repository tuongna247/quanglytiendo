namespace QuanLyTienDo.API.Models;

public class EbookComment
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid BookId { get; set; }
    public int PageNumber { get; set; }
    public Guid? HighlightId { get; set; }
    public int StartOffset { get; set; }
    public int EndOffset { get; set; }
    public string SelectedText { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public EbookBook Book { get; set; } = null!;
}
