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
[Route("api/journal")]
public class JournalController : ControllerBase
{
    private readonly AppDbContext _db;

    public JournalController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetByDate([FromQuery] string date)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var note = await _db.DailyNotes
            .FirstOrDefaultAsync(n => n.UserId == userId && n.Date == date);

        if (note is null) return Ok((object?)null);

        return Ok(MapToDto(note));
    }

    [HttpPost]
    public async Task<IActionResult> Save([FromBody] SaveDailyNoteRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var existing = await _db.DailyNotes
            .FirstOrDefaultAsync(n => n.UserId == userId && n.Date == request.Date);

        if (existing is not null)
        {
            existing.Content = request.Content;
            existing.TodoItems = request.TodoItems;
            existing.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(MapToDto(existing));
        }

        var note = new DailyNote
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Date = request.Date,
            Content = request.Content,
            TodoItems = request.TodoItems,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.DailyNotes.Add(note);
        await _db.SaveChangesAsync();
        return Ok(MapToDto(note));
    }

    private static DailyNoteDto MapToDto(DailyNote n) => new()
    {
        Id = n.Id,
        UserId = n.UserId,
        Date = n.Date,
        Content = n.Content,
        TodoItems = n.TodoItems,
        CreatedAt = n.CreatedAt,
        UpdatedAt = n.UpdatedAt
    };
}
