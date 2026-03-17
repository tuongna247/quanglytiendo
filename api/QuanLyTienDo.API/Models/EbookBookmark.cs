namespace QuanLyTienDo.API.Models;

public class EbookBookmark
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid BookId { get; set; }
    public int PageNumber { get; set; }
    public string Label { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public EbookBook Book { get; set; } = null!;
}
