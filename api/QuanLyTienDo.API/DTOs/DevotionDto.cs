namespace QuanLyTienDo.API.DTOs;

public class DailyDevotionDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Date { get; set; } = string.Empty;
    public string Passages { get; set; } = "[]";
    public string BibleTeaches { get; set; } = string.Empty;
    public string LessonLearned { get; set; } = string.Empty;
    public string Application { get; set; } = string.Empty;
    public string? PrayerPoints { get; set; }
    public string? MemorizeVerse { get; set; }
    public string? GodCharacter { get; set; }
    public string? SinToAvoid { get; set; }
    public string? PromiseToClaim { get; set; }
    public string? Mood { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class SaveDevotionRequest
{
    public string Date { get; set; } = string.Empty;
    public string Passages { get; set; } = "[]";
    public string BibleTeaches { get; set; } = string.Empty;
    public string LessonLearned { get; set; } = string.Empty;
    public string Application { get; set; } = string.Empty;
    public string? PrayerPoints { get; set; }
    public string? MemorizeVerse { get; set; }
    public string? GodCharacter { get; set; }
    public string? SinToAvoid { get; set; }
    public string? PromiseToClaim { get; set; }
    public string? Mood { get; set; }
}

public class BibleReadingPlanDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int TotalDays { get; set; }
    public string StartDate { get; set; } = string.Empty;
    public DateTime ImportedAt { get; set; }
    public List<BibleReadingDayDto> Days { get; set; } = new();
}

public class BibleReadingDayDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid PlanId { get; set; }
    public int DayNumber { get; set; }
    public string ScheduledDate { get; set; } = string.Empty;
    public string Readings { get; set; } = "[]";
    public bool IsCompleted { get; set; }
    public DateTime? CompletedAt { get; set; }
    public Guid? LinkedDevotionId { get; set; }
}

public class CreateBibleReadingPlanRequest
{
    public string Name { get; set; } = string.Empty;
    public int TotalDays { get; set; }
    public string StartDate { get; set; } = string.Empty;
    public List<CreateBibleReadingDayRequest> Days { get; set; } = new();
}

public class CreateBibleReadingDayRequest
{
    public int DayNumber { get; set; }
    public string ScheduledDate { get; set; } = string.Empty;
    public string Readings { get; set; } = "[]";
}
