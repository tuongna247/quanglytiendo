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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── User ──────────────────────────────────────────────────────────────
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.Property(u => u.Id).HasDefaultValueSql("NEWID()");
            e.Property(u => u.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.HasIndex(u => u.Username).IsUnique();
        });

        // ── CalendarEvent ────────────────────────────────────────────────────
        modelBuilder.Entity<CalendarEvent>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("NEWID()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.HasOne(x => x.User)
             .WithMany(u => u.CalendarEvents)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── TaskItem ─────────────────────────────────────────────────────────
        modelBuilder.Entity<TaskItem>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("NEWID()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.HasOne(x => x.User)
             .WithMany(u => u.Tasks)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Transaction ──────────────────────────────────────────────────────
        modelBuilder.Entity<Transaction>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("NEWID()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
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
            e.Property(x => x.Id).HasDefaultValueSql("NEWID()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.HasOne(x => x.User)
             .WithMany(u => u.PlannerItems)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── WeightLog ────────────────────────────────────────────────────────
        modelBuilder.Entity<WeightLog>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("NEWID()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
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
            e.Property(x => x.Id).HasDefaultValueSql("NEWID()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.HasOne(x => x.User)
             .WithMany(u => u.ExerciseSessions)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── HealthGoal ───────────────────────────────────────────────────────
        modelBuilder.Entity<HealthGoal>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("NEWID()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
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
            e.Property(x => x.Id).HasDefaultValueSql("NEWID()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
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
            e.Property(x => x.Id).HasDefaultValueSql("NEWID()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.HasOne(x => x.User)
             .WithMany(u => u.DailyNotes)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── DailyDevotion ────────────────────────────────────────────────────
        modelBuilder.Entity<DailyDevotion>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("NEWID()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.HasOne(x => x.User)
             .WithMany(u => u.DailyDevotions)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── BibleReadingPlan ─────────────────────────────────────────────────
        modelBuilder.Entity<BibleReadingPlan>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("NEWID()");
            e.Property(x => x.ImportedAt).HasDefaultValueSql("GETUTCDATE()");
            e.HasOne(x => x.User)
             .WithMany(u => u.BibleReadingPlans)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── BibleReadingDay ──────────────────────────────────────────────────
        modelBuilder.Entity<BibleReadingDay>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("NEWID()");
            e.HasOne(x => x.Plan)
             .WithMany(p => p.Days)
             .HasForeignKey(x => x.PlanId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── BibleReadingLog ──────────────────────────────────────────────────────
        modelBuilder.Entity<BibleReadingLog>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("NEWID()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
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
            e.Property(x => x.Id).HasDefaultValueSql("NEWID()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.Property(x => x.GeneratedPlanJson).HasColumnType("nvarchar(max)");
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
            e.Property(x => x.Id).HasDefaultValueSql("NEWID()");
            e.Property(x => x.AddedAt).HasDefaultValueSql("GETUTCDATE()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.HasOne(x => x.User)
             .WithMany(u => u.MemorizePassages)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── FixedExpense ─────────────────────────────────────────────────────────
        modelBuilder.Entity<FixedExpense>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("NEWID()");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.Property(x => x.UpdatedAt).HasDefaultValueSql("GETUTCDATE()");
            e.Property(x => x.Amount).HasColumnType("decimal(18,2)");
            e.HasOne(x => x.User)
             .WithMany(u => u.FixedExpenses)
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
