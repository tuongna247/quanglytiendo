namespace QuanLyTienDo.API.DTOs;

public class BibleStudySessionDto
{
    public Guid Id { get; set; }
    public string BookId { get; set; } = string.Empty;
    public int Chapter { get; set; }
    public int VerseFrom { get; set; }
    public int VerseTo { get; set; }
    public string Passage { get; set; } = string.Empty;

    // JSON strings returned as-is for client to parse
    public string ObservationJson { get; set; } = "{}";
    public string InterpretationJson { get; set; } = "{}";
    public string ApplicationJson { get; set; } = "{}";

    public bool IsCompleted { get; set; }
    public string CompletedStepsJson { get; set; } = "[]";
    public string ShareMode { get; set; } = "private";

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class SaveBibleStudySessionRequest
{
    public Guid? Id { get; set; }   // null = create, has value = update
    public string BookId { get; set; } = string.Empty;
    public int Chapter { get; set; }
    public int VerseFrom { get; set; }
    public int VerseTo { get; set; }
    public string Passage { get; set; } = string.Empty;

    public string ObservationJson { get; set; } = "{}";
    public string InterpretationJson { get; set; } = "{}";
    public string ApplicationJson { get; set; } = "{}";

    public bool IsCompleted { get; set; }
    public string CompletedStepsJson { get; set; } = "[]";
    public string ShareMode { get; set; } = "private";
}
