namespace QuanLyTienDo.API.Models;

public class EbookBook
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string PagesJson { get; set; } = "[]"; // JSON array of page strings
    public int TotalPages { get; set; }
    public DateTime UploadedAt { get; set; }
    public User User { get; set; } = null!;
    public ICollection<EbookHighlight> Highlights { get; set; } = new List<EbookHighlight>();
    public ICollection<EbookComment> Comments { get; set; } = new List<EbookComment>();
    public ICollection<EbookBookmark> Bookmarks { get; set; } = new List<EbookBookmark>();
    public ICollection<EbookProgress> Progresses { get; set; } = new List<EbookProgress>();
}
