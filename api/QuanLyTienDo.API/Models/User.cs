namespace QuanLyTienDo.API.Models;

public class User
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string AvatarColor { get; set; } = "#2196f3";
    public string? Email { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation
    public ICollection<CalendarEvent> CalendarEvents { get; set; } = new List<CalendarEvent>();
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public ICollection<PlannerItem> PlannerItems { get; set; } = new List<PlannerItem>();
    public ICollection<WeightLog> WeightLogs { get; set; } = new List<WeightLog>();
    public ICollection<ExerciseSession> ExerciseSessions { get; set; } = new List<ExerciseSession>();
    public ICollection<HealthGoal> HealthGoals { get; set; } = new List<HealthGoal>();
    public ICollection<BodyCheckIn> BodyCheckIns { get; set; } = new List<BodyCheckIn>();
    public ICollection<DailyNote> DailyNotes { get; set; } = new List<DailyNote>();
    public ICollection<DailyDevotion> DailyDevotions { get; set; } = new List<DailyDevotion>();
    public ICollection<BibleReadingPlan> BibleReadingPlans { get; set; } = new List<BibleReadingPlan>();
    public ICollection<BibleReadingLog> BibleReadingLogs { get; set; } = new List<BibleReadingLog>();
    public UserBiblePlanConfig? BiblePlanConfig { get; set; }
    public ICollection<MemorizePassage> MemorizePassages { get; set; } = new List<MemorizePassage>();
    public ICollection<FixedExpense> FixedExpenses { get; set; } = new List<FixedExpense>();
    public ICollection<EbookBook> EbookBooks { get; set; } = new List<EbookBook>();
    public ICollection<WorkoutSession> WorkoutSessions { get; set; } = new List<WorkoutSession>();
    public ICollection<UserWorkoutPlan> WorkoutPlans { get; set; } = new List<UserWorkoutPlan>();
}
