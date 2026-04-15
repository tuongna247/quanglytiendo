namespace QuanLyTienDo.API.Models;

public class BibleStudySession
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string BookId { get; set; } = string.Empty;      // "ph", "gn", ...
    public int Chapter { get; set; }
    public int VerseFrom { get; set; }
    public int VerseTo { get; set; }
    public string Passage { get; set; } = string.Empty;     // "Philippians 2:14-15"

    // Structured JSON per OIA layer
    public string ObservationJson { get; set; } = "{}";
    // { characters, actions, whereWhen, repeatedWords, connectingWords, commands, contrasts }

    public string InterpretationJson { get; set; } = "{}";
    // { mainIdea, whyImportant, aboutGod, aboutHuman, context }

    public string ApplicationJson { get; set; } = "{}";
    // { specificAction, when, obstacles, changeToday }

    public bool IsCompleted { get; set; } = false;
    public string CompletedStepsJson { get; set; } = "[]";  // ["obs","int","app"]

    // Phase 3: sharing support
    public string ShareMode { get; set; } = "private";      // "private"|"group"|"public"

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
}
