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
[Route("api/devotion")]
public class DevotionController : ControllerBase
{
    private readonly AppDbContext _db;

    public DevotionController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetByDate([FromQuery] string date)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var devotion = await _db.DailyDevotions
            .FirstOrDefaultAsync(d => d.UserId == userId && d.Date == date);

        if (devotion is null) return NotFound();

        return Ok(MapDevotionToDto(devotion));
    }

    [HttpPost]
    public async Task<IActionResult> Save([FromBody] SaveDevotionRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var existing = await _db.DailyDevotions
            .FirstOrDefaultAsync(d => d.UserId == userId && d.Date == request.Date);

        if (existing is not null)
        {
            existing.Passages = request.Passages;
            existing.BibleTeaches = request.BibleTeaches;
            existing.LessonLearned = request.LessonLearned;
            existing.Application = request.Application;
            existing.PrayerPoints = request.PrayerPoints;
            existing.MemorizeVerse = request.MemorizeVerse;
            existing.GodCharacter = request.GodCharacter;
            existing.SinToAvoid = request.SinToAvoid;
            existing.PromiseToClaim = request.PromiseToClaim;
            existing.Mood = request.Mood;
            existing.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(MapDevotionToDto(existing));
        }

        var devotion = new DailyDevotion
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Date = request.Date,
            Passages = request.Passages,
            BibleTeaches = request.BibleTeaches,
            LessonLearned = request.LessonLearned,
            Application = request.Application,
            PrayerPoints = request.PrayerPoints,
            MemorizeVerse = request.MemorizeVerse,
            GodCharacter = request.GodCharacter,
            SinToAvoid = request.SinToAvoid,
            PromiseToClaim = request.PromiseToClaim,
            Mood = request.Mood,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.DailyDevotions.Add(devotion);
        await _db.SaveChangesAsync();
        return Ok(MapDevotionToDto(devotion));
    }

    // ── Bible Reading Plans ───────────────────────────────────────────────────

    [HttpGet("plans")]
    public async Task<IActionResult> GetPlans()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var plans = await _db.BibleReadingPlans
            .Where(p => p.UserId == userId)
            .Include(p => p.Days)
            .OrderByDescending(p => p.ImportedAt)
            .ToListAsync();

        return Ok(plans.Select(MapPlanToDto));
    }

    [HttpPost("plans")]
    public async Task<IActionResult> CreatePlan([FromBody] CreateBibleReadingPlanRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var planId = Guid.NewGuid();
        var plan = new BibleReadingPlan
        {
            Id = planId,
            UserId = userId,
            Name = request.Name,
            TotalDays = request.TotalDays,
            StartDate = request.StartDate,
            ImportedAt = DateTime.UtcNow,
            Days = request.Days.Select(d => new BibleReadingDay
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                PlanId = planId,
                DayNumber = d.DayNumber,
                ScheduledDate = d.ScheduledDate,
                Readings = d.Readings,
                IsCompleted = false
            }).ToList()
        };

        _db.BibleReadingPlans.Add(plan);
        await _db.SaveChangesAsync();
        return Ok(MapPlanToDto(plan));
    }

    [HttpGet("plans/{planId}/day")]
    public async Task<IActionResult> GetReadingDay(Guid planId, [FromQuery] string date)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        // Verify plan belongs to user
        var plan = await _db.BibleReadingPlans
            .FirstOrDefaultAsync(p => p.Id == planId && p.UserId == userId);

        if (plan is null) return NotFound();

        var day = await _db.BibleReadingDays
            .FirstOrDefaultAsync(d => d.PlanId == planId && d.ScheduledDate == date);

        if (day is null) return NotFound();

        return Ok(MapDayToDto(day));
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    private static DailyDevotionDto MapDevotionToDto(DailyDevotion d) => new()
    {
        Id = d.Id,
        UserId = d.UserId,
        Date = d.Date,
        Passages = d.Passages,
        BibleTeaches = d.BibleTeaches,
        LessonLearned = d.LessonLearned,
        Application = d.Application,
        PrayerPoints = d.PrayerPoints,
        MemorizeVerse = d.MemorizeVerse,
        GodCharacter = d.GodCharacter,
        SinToAvoid = d.SinToAvoid,
        PromiseToClaim = d.PromiseToClaim,
        Mood = d.Mood,
        CreatedAt = d.CreatedAt,
        UpdatedAt = d.UpdatedAt
    };

    private static BibleReadingPlanDto MapPlanToDto(BibleReadingPlan p) => new()
    {
        Id = p.Id,
        UserId = p.UserId,
        Name = p.Name,
        TotalDays = p.TotalDays,
        StartDate = p.StartDate,
        ImportedAt = p.ImportedAt,
        Days = p.Days.Select(MapDayToDto).ToList()
    };

    private static BibleReadingDayDto MapDayToDto(BibleReadingDay d) => new()
    {
        Id = d.Id,
        UserId = d.UserId,
        PlanId = d.PlanId,
        DayNumber = d.DayNumber,
        ScheduledDate = d.ScheduledDate,
        Readings = d.Readings,
        IsCompleted = d.IsCompleted,
        CompletedAt = d.CompletedAt,
        LinkedDevotionId = d.LinkedDevotionId
    };
}
