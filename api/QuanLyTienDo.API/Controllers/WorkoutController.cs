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
[Route("api/workout")]
public class WorkoutController : ControllerBase
{
    private readonly AppDbContext _db;
    public WorkoutController(AppDbContext db) { _db = db; }

    private Guid UserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    // ── Sessions ──────────────────────────────────────────────────────────────

    [HttpGet]
    public async Task<IActionResult> GetSessions([FromQuery] string? from, [FromQuery] string? to)
    {
        var query = _db.WorkoutSessions
            .Where(s => s.UserId == UserId)
            .Include(s => s.Exercises.OrderBy(e => e.OrderIndex))
                .ThenInclude(e => e.Sets.OrderBy(s => s.SetNumber))
            .AsQueryable();

        if (!string.IsNullOrEmpty(from)) query = query.Where(s => string.Compare(s.Date, from) >= 0);
        if (!string.IsNullOrEmpty(to))   query = query.Where(s => string.Compare(s.Date, to) <= 0);

        var sessions = await query.OrderByDescending(s => s.Date).ToListAsync();
        return Ok(sessions.Select(MapSession));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSession(Guid id)
    {
        var session = await _db.WorkoutSessions
            .Where(s => s.Id == id && s.UserId == UserId)
            .Include(s => s.Exercises.OrderBy(e => e.OrderIndex))
                .ThenInclude(e => e.Sets.OrderBy(s => s.SetNumber))
            .FirstOrDefaultAsync();

        if (session is null) return NotFound();
        return Ok(MapSession(session));
    }

    [HttpPost]
    public async Task<IActionResult> CreateSession([FromBody] CreateWorkoutSessionRequest req)
    {
        var session = new WorkoutSession
        {
            Id = Guid.NewGuid(),
            UserId = UserId,
            Date = req.Date,
            Name = req.Name,
            DurationMinutes = req.DurationMinutes,
            CaloriesBurned = req.CaloriesBurned,
            Notes = req.Notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.WorkoutSessions.Add(session);
        await _db.SaveChangesAsync();
        return Ok(MapSession(session));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSession(Guid id)
    {
        var session = await _db.WorkoutSessions.FirstOrDefaultAsync(s => s.Id == id && s.UserId == UserId);
        if (session is null) return NotFound();
        _db.WorkoutSessions.Remove(session);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ── Exercises ─────────────────────────────────────────────────────────────

    [HttpPost("{sessionId}/exercises")]
    public async Task<IActionResult> AddExercise(Guid sessionId, [FromBody] AddExerciseRequest req)
    {
        var session = await _db.WorkoutSessions.FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == UserId);
        if (session is null) return NotFound();

        var exercise = new WorkoutExercise
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            Name = req.Name,
            MuscleGroup = req.MuscleGroup,
            OrderIndex = req.OrderIndex,
        };
        _db.WorkoutExercises.Add(exercise);
        await _db.SaveChangesAsync();
        return Ok(MapExercise(exercise));
    }

    [HttpDelete("exercises/{exerciseId}")]
    public async Task<IActionResult> DeleteExercise(Guid exerciseId)
    {
        var exercise = await _db.WorkoutExercises
            .Include(e => e.Session)
            .FirstOrDefaultAsync(e => e.Id == exerciseId && e.Session.UserId == UserId);
        if (exercise is null) return NotFound();
        _db.WorkoutExercises.Remove(exercise);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ── Sets ──────────────────────────────────────────────────────────────────

    [HttpPost("exercises/{exerciseId}/sets")]
    public async Task<IActionResult> AddSet(Guid exerciseId, [FromBody] AddSetRequest req)
    {
        var exercise = await _db.WorkoutExercises
            .Include(e => e.Session)
            .FirstOrDefaultAsync(e => e.Id == exerciseId && e.Session.UserId == UserId);
        if (exercise is null) return NotFound();

        var set = new WorkoutSet
        {
            Id = Guid.NewGuid(),
            ExerciseId = exerciseId,
            SetNumber = req.SetNumber,
            Reps = req.Reps,
            WeightKg = req.WeightKg,
            DurationSeconds = req.DurationSeconds,
            Rpe = req.Rpe,
        };
        _db.WorkoutSets.Add(set);
        await _db.SaveChangesAsync();
        return Ok(MapSet(set));
    }

    [HttpPut("sets/{setId}")]
    public async Task<IActionResult> UpdateSet(Guid setId, [FromBody] UpdateSetRequest req)
    {
        var set = await _db.WorkoutSets
            .Include(s => s.Exercise).ThenInclude(e => e.Session)
            .FirstOrDefaultAsync(s => s.Id == setId && s.Exercise.Session.UserId == UserId);
        if (set is null) return NotFound();

        set.Reps = req.Reps;
        set.WeightKg = req.WeightKg;
        set.DurationSeconds = req.DurationSeconds;
        set.Rpe = req.Rpe;
        await _db.SaveChangesAsync();
        return Ok(MapSet(set));
    }

    [HttpDelete("sets/{setId}")]
    public async Task<IActionResult> DeleteSet(Guid setId)
    {
        var set = await _db.WorkoutSets
            .Include(s => s.Exercise).ThenInclude(e => e.Session)
            .FirstOrDefaultAsync(s => s.Id == setId && s.Exercise.Session.UserId == UserId);
        if (set is null) return NotFound();
        _db.WorkoutSets.Remove(set);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ── History (progression per exercise) ───────────────────────────────────

    [HttpGet("history/{exerciseName}")]
    public async Task<IActionResult> GetExerciseHistory(string exerciseName)
    {
        var history = await _db.WorkoutExercises
            .Where(e => e.Session.UserId == UserId && e.Name == exerciseName)
            .Include(e => e.Session)
            .Include(e => e.Sets)
            .OrderBy(e => e.Session.Date)
            .Select(e => new
            {
                date = e.Session.Date,
                sets = e.Sets.OrderBy(s => s.SetNumber).Select(s => new
                {
                    s.SetNumber, s.Reps, s.WeightKg, s.DurationSeconds, s.Rpe
                })
            })
            .ToListAsync();

        return Ok(history);
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    private static WorkoutSessionDto MapSession(WorkoutSession s) => new()
    {
        Id = s.Id,
        Date = s.Date,
        Name = s.Name,
        Source = s.Source,
        DurationMinutes = s.DurationMinutes,
        CaloriesBurned = s.CaloriesBurned,
        Notes = s.Notes,
        CreatedAt = s.CreatedAt,
        Exercises = s.Exercises.Select(MapExercise).ToList(),
    };

    private static WorkoutExerciseDto MapExercise(WorkoutExercise e) => new()
    {
        Id = e.Id,
        Name = e.Name,
        MuscleGroup = e.MuscleGroup,
        OrderIndex = e.OrderIndex,
        Sets = e.Sets.Select(MapSet).ToList(),
    };

    private static WorkoutSetDto MapSet(WorkoutSet s) => new()
    {
        Id = s.Id,
        SetNumber = s.SetNumber,
        Reps = s.Reps,
        WeightKg = s.WeightKg,
        DurationSeconds = s.DurationSeconds,
        Rpe = s.Rpe,
    };
}
