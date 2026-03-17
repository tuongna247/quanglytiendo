namespace QuanLyTienDo.API.Models;

public class EbookProgress
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid BookId { get; set; }
    public int CurrentPage { get; set; }
    public DateTime LastReadAt { get; set; }
    public EbookBook Book { get; set; } = null!;
}
