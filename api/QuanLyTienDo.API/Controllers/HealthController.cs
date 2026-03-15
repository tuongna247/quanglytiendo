using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyTienDo.API.Data;
using QuanLyTienDo.API.DTOs;
using QuanLyTienDo.API.Models;

namespace QuanLyTienDo.API.Controllers;

[Authorize]
[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _db;

    public HealthController(AppDbContext db)
    {
        _db = db;
    }

    // ── Weight Logs ───────────────────────────────────────────────────────────

    [HttpGet("weight")]
    public async Task<IActionResult> GetWeightLogs()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var logs = await _db.WeightLogs
            .Where(w => w.UserId == userId)
            .OrderBy(w => w.Date)
            .ToListAsync();
        return Ok(logs.Select(MapWeightToDto));
    }

    [HttpPost("weight")]
    public async Task<IActionResult> CreateWeightLog([FromBody] CreateWeightLogRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var log = new WeightLog
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Date = request.Date,
            WeightKg = request.WeightKg,
            BodyFatPct = request.BodyFatPct,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow
        };

        _db.WeightLogs.Add(log);
        await _db.SaveChangesAsync();
        return Ok(MapWeightToDto(log));
    }

    [HttpDelete("weight/{id}")]
    public async Task<IActionResult> DeleteWeightLog(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var log = await _db.WeightLogs.FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

        if (log is null) return NotFound();

        _db.WeightLogs.Remove(log);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ── Exercise Sessions ─────────────────────────────────────────────────────

    [HttpGet("exercise")]
    public async Task<IActionResult> GetExerciseSessions()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var sessions = await _db.ExerciseSessions
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.Date)
            .ToListAsync();
        return Ok(sessions.Select(MapExerciseToDto));
    }

    [HttpPost("exercise")]
    public async Task<IActionResult> CreateExerciseSession([FromBody] CreateExerciseSessionRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var session = new ExerciseSession
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Date = request.Date,
            Type = request.Type,
            Name = request.Name,
            DurationMinutes = request.DurationMinutes,
            CaloriesBurned = request.CaloriesBurned,
            Intensity = request.Intensity,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.ExerciseSessions.Add(session);
        await _db.SaveChangesAsync();
        return Ok(MapExerciseToDto(session));
    }

    [HttpDelete("exercise/{id}")]
    public async Task<IActionResult> DeleteExerciseSession(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var session = await _db.ExerciseSessions.FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (session is null) return NotFound();

        _db.ExerciseSessions.Remove(session);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ── Health Goal ───────────────────────────────────────────────────────────

    [HttpGet("goal")]
    public async Task<IActionResult> GetActiveGoal()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var goal = await _db.HealthGoals
            .Where(g => g.UserId == userId && g.IsActive)
            .OrderByDescending(g => g.CreatedAt)
            .FirstOrDefaultAsync();

        if (goal is null) return NotFound();

        return Ok(MapGoalToDto(goal));
    }

    [HttpPost("goal")]
    public async Task<IActionResult> SaveGoal([FromBody] SaveHealthGoalRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        // Deactivate existing active goals
        var existing = await _db.HealthGoals
            .Where(g => g.UserId == userId && g.IsActive)
            .ToListAsync();

        foreach (var g in existing)
        {
            g.IsActive = false;
            g.UpdatedAt = DateTime.UtcNow;
        }

        var goal = new HealthGoal
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            StartDate = request.StartDate,
            TargetDate = request.TargetDate,
            StartWeightKg = request.StartWeightKg,
            TargetWeightKg = request.TargetWeightKg,
            HeightCm = request.HeightCm,
            DailyCalorieTarget = request.DailyCalorieTarget,
            WeeklyExerciseDays = request.WeeklyExerciseDays,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.HealthGoals.Add(goal);
        await _db.SaveChangesAsync();
        return Ok(MapGoalToDto(goal));
    }

    // ── Body Check-In ─────────────────────────────────────────────────────────

    [HttpGet("checkin")]
    public async Task<IActionResult> GetCheckIn([FromQuery] string date)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var checkIn = await _db.BodyCheckIns
            .FirstOrDefaultAsync(c => c.UserId == userId && c.Date == date);

        if (checkIn is null) return NotFound();

        return Ok(MapCheckInToDto(checkIn));
    }

    [HttpPost("checkin")]
    public async Task<IActionResult> SaveCheckIn([FromBody] SaveBodyCheckInRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var existing = await _db.BodyCheckIns
            .FirstOrDefaultAsync(c => c.UserId == userId && c.Date == request.Date);

        if (existing is not null)
        {
            existing.EnergyLevel = request.EnergyLevel;
            existing.MoodLevel = request.MoodLevel;
            existing.SleepQuality = request.SleepQuality;
            existing.SleepHours = request.SleepHours;
            existing.MuscleSoreness = request.MuscleSoreness;
            existing.SoreAreas = request.SoreAreas;
            existing.PainNotes = request.PainNotes;
            existing.StressLevel = request.StressLevel;
            existing.GeneralNotes = request.GeneralNotes;
            existing.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(MapCheckInToDto(existing));
        }

        var checkIn = new BodyCheckIn
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Date = request.Date,
            EnergyLevel = request.EnergyLevel,
            MoodLevel = request.MoodLevel,
            SleepQuality = request.SleepQuality,
            SleepHours = request.SleepHours,
            MuscleSoreness = request.MuscleSoreness,
            SoreAreas = request.SoreAreas,
            PainNotes = request.PainNotes,
            StressLevel = request.StressLevel,
            GeneralNotes = request.GeneralNotes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.BodyCheckIns.Add(checkIn);
        await _db.SaveChangesAsync();
        return Ok(MapCheckInToDto(checkIn));
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    private static WeightLogDto MapWeightToDto(WeightLog w) => new()
    {
        Id = w.Id,
        UserId = w.UserId,
        Date = w.Date,
        WeightKg = w.WeightKg,
        BodyFatPct = w.BodyFatPct,
        Notes = w.Notes,
        CreatedAt = w.CreatedAt
    };

    private static ExerciseSessionDto MapExerciseToDto(ExerciseSession e) => new()
    {
        Id = e.Id,
        UserId = e.UserId,
        Date = e.Date,
        Type = e.Type,
        Name = e.Name,
        DurationMinutes = e.DurationMinutes,
        CaloriesBurned = e.CaloriesBurned,
        Intensity = e.Intensity,
        Notes = e.Notes,
        CreatedAt = e.CreatedAt,
        UpdatedAt = e.UpdatedAt
    };

    private static HealthGoalDto MapGoalToDto(HealthGoal g) => new()
    {
        Id = g.Id,
        UserId = g.UserId,
        StartDate = g.StartDate,
        TargetDate = g.TargetDate,
        StartWeightKg = g.StartWeightKg,
        TargetWeightKg = g.TargetWeightKg,
        HeightCm = g.HeightCm,
        DailyCalorieTarget = g.DailyCalorieTarget,
        WeeklyExerciseDays = g.WeeklyExerciseDays,
        IsActive = g.IsActive,
        CreatedAt = g.CreatedAt,
        UpdatedAt = g.UpdatedAt
    };

    private static BodyCheckInDto MapCheckInToDto(BodyCheckIn c) => new()
    {
        Id = c.Id,
        UserId = c.UserId,
        Date = c.Date,
        EnergyLevel = c.EnergyLevel,
        MoodLevel = c.MoodLevel,
        SleepQuality = c.SleepQuality,
        SleepHours = c.SleepHours,
        MuscleSoreness = c.MuscleSoreness,
        SoreAreas = c.SoreAreas,
        PainNotes = c.PainNotes,
        StressLevel = c.StressLevel,
        GeneralNotes = c.GeneralNotes,
        CreatedAt = c.CreatedAt,
        UpdatedAt = c.UpdatedAt
    };
}
