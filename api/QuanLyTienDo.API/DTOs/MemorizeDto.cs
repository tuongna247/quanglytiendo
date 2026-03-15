namespace QuanLyTienDo.API.DTOs;

public class MemorizePassageDto
{
    public Guid Id { get; set; }
    public string Reference { get; set; } = string.Empty;
    public string ParsedJson { get; set; } = "{}";
    public string MasteredJson { get; set; } = "[]";
    public DateTime AddedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateMemorizePassageRequest
{
    public string Reference { get; set; } = string.Empty;
    public string ParsedJson { get; set; } = "{}";
    public string MasteredJson { get; set; } = "[]";
}

public class UpdateMemorizeMasteredRequest
{
    public string MasteredJson { get; set; } = "[]";
}
