namespace QuanLyTienDo.API.DTOs;

public class BiblePlanConfigDto
{
    public string Type { get; set; } = "option1";
    public string Duration { get; set; } = "1y";
    public string StartDate { get; set; } = string.Empty;
    public int? StartWeekOverride { get; set; }
    public string? GeneratedPlanJson { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class SaveBiblePlanConfigRequest
{
    public string Type { get; set; } = "option1";
    public string Duration { get; set; } = "1y";
    public string StartDate { get; set; } = string.Empty;
    public int? StartWeekOverride { get; set; }
    public string? GeneratedPlanJson { get; set; }
}
