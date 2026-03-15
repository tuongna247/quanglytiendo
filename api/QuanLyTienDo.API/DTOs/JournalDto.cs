namespace QuanLyTienDo.API.DTOs;

public class DailyNoteDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Date { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string TodoItems { get; set; } = "[]";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class SaveDailyNoteRequest
{
    public string Date { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string TodoItems { get; set; } = "[]";
}
