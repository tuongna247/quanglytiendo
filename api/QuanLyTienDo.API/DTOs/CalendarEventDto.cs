namespace QuanLyTienDo.API.DTOs;

public class CalendarEventDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartAt { get; set; }
    public DateTime EndAt { get; set; }
    public bool AllDay { get; set; }
    public string Color { get; set; } = "#2196f3";
    public string Category { get; set; } = "general";
    public string Recurrence { get; set; } = "none";
    public DateTime? RecurrenceEndDate { get; set; }
    public int? ReminderMinutes { get; set; }
    public Guid? LinkedTaskId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateCalendarEventRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartAt { get; set; }
    public DateTime EndAt { get; set; }
    public bool AllDay { get; set; }
    public string Color { get; set; } = "#2196f3";
    public string Category { get; set; } = "general";
    public string Recurrence { get; set; } = "none";
    public DateTime? RecurrenceEndDate { get; set; }
    public int? ReminderMinutes { get; set; }
    public Guid? LinkedTaskId { get; set; }
}

public class UpdateCalendarEventRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateTime? StartAt { get; set; }
    public DateTime? EndAt { get; set; }
    public bool? AllDay { get; set; }
    public string? Color { get; set; }
    public string? Category { get; set; }
    public string? Recurrence { get; set; }
    public DateTime? RecurrenceEndDate { get; set; }
    public int? ReminderMinutes { get; set; }
    public Guid? LinkedTaskId { get; set; }
}
