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
[Route("api/calendar-events")]
public class CalendarEventsController : ControllerBase
{
    private readonly AppDbContext _db;

    public CalendarEventsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var query = _db.CalendarEvents.Where(e => e.UserId == userId);

        if (from.HasValue)
            query = query.Where(e => e.EndAt >= from.Value);

        if (to.HasValue)
            query = query.Where(e => e.StartAt <= to.Value);

        var events = await query.OrderBy(e => e.StartAt).ToListAsync();

        return Ok(events.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var ev = await _db.CalendarEvents.FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (ev is null) return NotFound();

        return Ok(MapToDto(ev));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCalendarEventRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var ev = new CalendarEvent
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = request.Title,
            Description = request.Description,
            StartAt = request.StartAt,
            EndAt = request.EndAt,
            AllDay = request.AllDay,
            Color = request.Color,
            Category = request.Category,
            Recurrence = request.Recurrence,
            RecurrenceEndDate = request.RecurrenceEndDate,
            ReminderMinutes = request.ReminderMinutes,
            LinkedTaskId = request.LinkedTaskId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.CalendarEvents.Add(ev);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = ev.Id }, MapToDto(ev));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCalendarEventRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var ev = await _db.CalendarEvents.FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (ev is null) return NotFound();

        if (request.Title is not null) ev.Title = request.Title;
        if (request.Description is not null) ev.Description = request.Description;
        if (request.StartAt.HasValue) ev.StartAt = request.StartAt.Value;
        if (request.EndAt.HasValue) ev.EndAt = request.EndAt.Value;
        if (request.AllDay.HasValue) ev.AllDay = request.AllDay.Value;
        if (request.Color is not null) ev.Color = request.Color;
        if (request.Category is not null) ev.Category = request.Category;
        if (request.Recurrence is not null) ev.Recurrence = request.Recurrence;
        if (request.RecurrenceEndDate.HasValue) ev.RecurrenceEndDate = request.RecurrenceEndDate;
        if (request.ReminderMinutes.HasValue) ev.ReminderMinutes = request.ReminderMinutes;
        if (request.LinkedTaskId.HasValue) ev.LinkedTaskId = request.LinkedTaskId;
        ev.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(MapToDto(ev));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var ev = await _db.CalendarEvents.FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (ev is null) return NotFound();

        _db.CalendarEvents.Remove(ev);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static CalendarEventDto MapToDto(CalendarEvent ev) => new()
    {
        Id = ev.Id,
        UserId = ev.UserId,
        Title = ev.Title,
        Description = ev.Description,
        StartAt = ev.StartAt,
        EndAt = ev.EndAt,
        AllDay = ev.AllDay,
        Color = ev.Color,
        Category = ev.Category,
        Recurrence = ev.Recurrence,
        RecurrenceEndDate = ev.RecurrenceEndDate,
        ReminderMinutes = ev.ReminderMinutes,
        LinkedTaskId = ev.LinkedTaskId,
        CreatedAt = ev.CreatedAt,
        UpdatedAt = ev.UpdatedAt
    };
}
