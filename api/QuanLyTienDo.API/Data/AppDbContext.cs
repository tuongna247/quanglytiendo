using Microsoft.EntityFrameworkCore;
using QuanLyTienDo.API.Models;

namespace QuanLyTienDo.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<CalendarEvent> CalendarEvents => Set<CalendarEvent>();
    public DbSet<TaskItem> TaskItems => Set<TaskItem>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<PlannerItem> PlannerItems => Set<PlannerItem>();
    public DbSet<WeightLog> WeightLogs => Set<WeightLog>();
    public DbSet<ExerciseSession> ExerciseSessions => Set<ExerciseSession>();
    public DbSet<HealthGoal> HealthGoals => Set<HealthGoal>();
    public DbSet<BodyCheckIn> BodyCheckIns => Set<BodyCheckIn>();
    public DbSet<DailyNote> DailyNotes => Set<DailyNote>();
    public DbSet<DailyDevotion> DailyDevotions => Set<DailyDevotion>();
    public DbSet<BibleReadingPlan> BibleReadingPlans => Set<BibleReadingPlan>();
    public DbSet<BibleReadingDay> BibleReadingDays => Set<BibleReadingDay>();
    public DbSet<BibleReadingLog> BibleReadingLogs => Set<BibleReadingLog>();
    public DbSet<UserBiblePlanConfig> UserBiblePlanConfigs => Set<UserBiblePlanConfig>();
    public DbSet<MemorizePassage> MemorizePassages => Set<MemorizePassage>();
    public DbSet<FixedExpense> FixedExpenses => Set<FixedExpense>();
    public DbSet<FixedExpenseApplication> FixedExpenseApplications => Set<FixedExpenseApplication>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<EbookBook> EbookBooks => Set<EbookBook>();
    public DbSet<EbookHighlight> EbookHighlights => Set<EbookHighlight>();
    public DbSet<EbookComment> EbookComments => Set<EbookComment>();
    public DbSet<EbookBookmark> EbookBookmarks => Set<EbookBookmark>();
    public DbSet<EbookProgress> EbookProgresses => Set<EbookProgress>();
    public DbSet<Friendship> Friendships => Set<Friendship>();
    public DbSet<UserShareSettings> UserShareSettings => Set<UserShareSettings>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public DbSet<BibleVerseHighlight> BibleVerseHighlights => Set<BibleVerseHighlight>();
    public DbSet<BibleStudySession> BibleStudySessions => Set<BibleStudySession>();
    public DbSet<WorkoutSession> WorkoutSessions => Set<WorkoutSession>();
    public DbSet<WorkoutExercise> WorkoutExercises => Set<WorkoutExercise>();
    public DbSet<WorkoutSet> WorkoutSets => Set<WorkoutSet>();
    public DbSet<UserWorkoutPlan> UserWorkoutPlans => Set<UserWorkoutPlan>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── User ──────────────────────────────────────────────────────────────
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.Property(u => u.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(u => u.CreatedAt).HasDefaultValueSql("now()");
            e.HasIndex(u => u.Username).IsUnique();
            e.HasIndex(u => u.Email).IsUnique().HasFilter("\"Email\" IS NOT NULL");
        });

        modelBuilder.Entity<PasswordResetToken>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.HasOne(x => x.User)
             .WithMany()
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── CalendarEvent ────────────────────────────────────────────────────
        modelBuilder.Entity<CalendarEvent>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
            e.HasOne(x => x.User)
             .WithMany(u => u.CalendarEvents)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── TaskItem ─────────────────────────────────────────────────────────
        modelBuilder.Entity<TaskItem>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
            e.HasOne(x => x.User)
             .WithMany(u => u.Tasks)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Transaction ──────────────────────────────────────────────────────
        modelBuilder.Entity<Transaction>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.Amount).HasColumnType("decimal(18,2)");
            e.HasOne(x => x.User)
             .WithMany(u => u.Transactions)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── PlannerItem ──────────────────────────────────────────────────────
        modelBuilder.Entity<PlannerItem>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
            e.HasOne(x => x.User)
             .WithMany(u => u.PlannerItems)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── WeightLog ────────────────────────────────────────────────────────
        modelBuilder.Entity<WeightLog>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.WeightKg).HasColumnType("decimal(5,2)");
            e.Property(x => x.BodyFatPct).HasColumnType("decimal(5,2)");
            e.HasOne(x => x.User)
             .WithMany(u => u.WeightLogs)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── ExerciseSession ──────────────────────────────────────────────────
        modelBuilder.Entity<ExerciseSession>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
            e.HasOne(x => x.User)
             .WithMany(u => u.ExerciseSessions)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── HealthGoal ───────────────────────────────────────────────────────
        modelBuilder.Entity<HealthGoal>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.StartWeightKg).HasColumnType("decimal(5,2)");
            e.Property(x => x.TargetWeightKg).HasColumnType("decimal(5,2)");
            e.Property(x => x.HeightCm).HasColumnType("decimal(5,2)");
            e.HasOne(x => x.User)
             .WithMany(u => u.HealthGoals)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── BodyCheckIn ──────────────────────────────────────────────────────
        modelBuilder.Entity<BodyCheckIn>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.SleepHours).HasColumnType("decimal(4,2)");
            e.HasOne(x => x.User)
             .WithMany(u => u.BodyCheckIns)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── DailyNote ────────────────────────────────────────────────────────
        modelBuilder.Entity<DailyNote>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
            e.HasOne(x => x.User)
             .WithMany(u => u.DailyNotes)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── DailyDevotion ────────────────────────────────────────────────────
        modelBuilder.Entity<DailyDevotion>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
            e.HasOne(x => x.User)
             .WithMany(u => u.DailyDevotions)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── BibleReadingPlan ─────────────────────────────────────────────────
        modelBuilder.Entity<BibleReadingPlan>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.ImportedAt).HasDefaultValueSql("now()");
            e.HasOne(x => x.User)
             .WithMany(u => u.BibleReadingPlans)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── BibleReadingDay ──────────────────────────────────────────────────
        modelBuilder.Entity<BibleReadingDay>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.HasOne(x => x.Plan)
             .WithMany(p => p.Days)
             .HasForeignKey(x => x.PlanId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── BibleReadingLog ──────────────────────────────────────────────────────
        modelBuilder.Entity<BibleReadingLog>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.HasIndex(x => new { x.UserId, x.Date }).IsUnique();
            e.HasOne(x => x.User)
             .WithMany(u => u.BibleReadingLogs)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── UserBiblePlanConfig ──────────────────────────────────────────────────
        modelBuilder.Entity<UserBiblePlanConfig>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.GeneratedPlanJson).HasColumnType("text");
            e.HasIndex(x => x.UserId).IsUnique();
            e.HasOne(x => x.User)
             .WithOne(u => u.BiblePlanConfig)
             .HasForeignKey<UserBiblePlanConfig>(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── MemorizePassage ──────────────────────────────────────────────────────
        modelBuilder.Entity<MemorizePassage>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.AddedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
            e.HasOne(x => x.User)
             .WithMany(u => u.MemorizePassages)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── FixedExpense ─────────────────────────────────────────────────────────
        modelBuilder.Entity<FixedExpense>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.Amount).HasColumnType("decimal(18,2)");
            e.HasOne(x => x.User)
             .WithMany(u => u.FixedExpenses)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── FixedExpenseApplication ──────────────────────────────────────────────
        modelBuilder.Entity<FixedExpenseApplication>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.AppliedAt).HasDefaultValueSql("now()");
            e.HasOne(x => x.FixedExpense)
             .WithMany(f => f.Applications)
             .HasForeignKey(x => x.FixedExpenseId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── EbookBook ────────────────────────────────────────────────────────────
        modelBuilder.Entity<EbookBook>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.UploadedAt).HasDefaultValueSql("now()");
            e.Property(x => x.PagesJson).HasColumnType("text");
            e.HasOne(x => x.User)
             .WithMany(u => u.EbookBooks)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── EbookHighlight ───────────────────────────────────────────────────────
        modelBuilder.Entity<EbookHighlight>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.HasOne(x => x.Book)
             .WithMany(b => b.Highlights)
             .HasForeignKey(x => x.BookId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── EbookComment ─────────────────────────────────────────────────────────
        modelBuilder.Entity<EbookComment>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
            e.HasOne(x => x.Book)
             .WithMany(b => b.Comments)
             .HasForeignKey(x => x.BookId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── EbookBookmark ────────────────────────────────────────────────────────
        modelBuilder.Entity<EbookBookmark>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.HasOne(x => x.Book)
             .WithMany(b => b.Bookmarks)
             .HasForeignKey(x => x.BookId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── EbookProgress ────────────────────────────────────────────────────────
        modelBuilder.Entity<EbookProgress>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.LastReadAt).HasDefaultValueSql("now()");
            e.HasIndex(x => new { x.UserId, x.BookId }).IsUnique();
            e.HasOne(x => x.Book)
             .WithMany(b => b.Progresses)
             .HasForeignKey(x => x.BookId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Friendship ───────────────────────────────────────────────────────────
        modelBuilder.Entity<Friendship>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
            e.HasIndex(x => new { x.RequesterId, x.AddresseeId }).IsUnique();
            // Restrict to avoid multiple cascade paths (SQL Server limitation)
            e.HasOne(x => x.Requester)
             .WithMany()
             .HasForeignKey(x => x.RequesterId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Addressee)
             .WithMany()
             .HasForeignKey(x => x.AddresseeId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── UserShareSettings ────────────────────────────────────────────────────
        modelBuilder.Entity<UserShareSettings>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
            e.HasIndex(x => x.UserId).IsUnique();
            e.HasOne(x => x.User)
             .WithOne()
             .HasForeignKey<UserShareSettings>(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── ChatMessage ──────────────────────────────────────────────────────────
        modelBuilder.Entity<ChatMessage>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            // Restrict to avoid multiple cascade paths (SQL Server limitation)
            e.HasOne(x => x.Sender)
             .WithMany()
             .HasForeignKey(x => x.SenderId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Receiver)
             .WithMany()
             .HasForeignKey(x => x.ReceiverId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── BibleStudySession ────────────────────────────────────────────────────
        modelBuilder.Entity<BibleStudySession>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.ObservationJson).HasColumnType("text");
            e.Property(x => x.InterpretationJson).HasColumnType("text");
            e.Property(x => x.ApplicationJson).HasColumnType("text");
            e.HasIndex(x => new { x.UserId, x.BookId, x.Chapter });
            e.HasOne(x => x.User)
             .WithMany()
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── WorkoutSession / Exercise / Set ─────────────────────────────────────
        modelBuilder.Entity<WorkoutSession>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
            e.HasOne(x => x.User)
             .WithMany(u => u.WorkoutSessions)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<WorkoutExercise>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.HasOne(x => x.Session)
             .WithMany(s => s.Exercises)
             .HasForeignKey(x => x.SessionId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<WorkoutSet>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.WeightKg).HasColumnType("decimal(6,2)");
            e.HasOne(x => x.Exercise)
             .WithMany(ex => ex.Sets)
             .HasForeignKey(x => x.ExerciseId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── UserWorkoutPlan ──────────────────────────────────────────────────────
        modelBuilder.Entity<UserWorkoutPlan>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.CompletedDaysJson).HasColumnType("text");
            e.HasIndex(x => new { x.UserId, x.Status });
            e.HasOne(x => x.User)
             .WithMany(u => u.WorkoutPlans)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── BibleVerseHighlight ──────────────────────────────────────────────────
        modelBuilder.Entity<BibleVerseHighlight>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("now()");
            e.Property(x => x.HighlightJson).HasColumnType("text");
            e.HasIndex(x => new { x.UserId, x.BookId, x.Chapter }).IsUnique();
            e.HasOne(x => x.User)
             .WithMany()
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
