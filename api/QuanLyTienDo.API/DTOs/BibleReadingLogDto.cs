namespace QuanLyTienDo.API.DTOs;

public class ToggleBibleReadingLogRequest
{
    public string Date { get; set; } = string.Empty; // "YYYY-MM-DD"
    public bool Completed { get; set; }
}
