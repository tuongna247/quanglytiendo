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
[Route("api/bible-study-sessions")]
public class BibleStudySessionController : ControllerBase
{
    private readonly AppDbContext _db;
    public BibleStudySessionController(AppDbContext db) { _db = db; }

    private Guid UserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    // GET /api/bible-study-sessions/history
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        var rows = await _db.BibleStudySessions
            .Where(x => x.UserId == UserId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(rows.Select(ToDto));
    }

    // GET /api/bible-study-sessions?book=ph&chapter=2
    [HttpGet]
    public async Task<IActionResult> GetByChapter([FromQuery] string book, [FromQuery] int chapter)
    {
        var rows = await _db.BibleStudySessions
            .Where(x => x.UserId == UserId && x.BookId == book && x.Chapter == chapter)
            .OrderBy(x => x.VerseFrom)
            .ToListAsync();

        return Ok(rows.Select(ToDto));
    }

    // POST /api/bible-study-sessions — create or update
    [HttpPost]
    public async Task<IActionResult> Save([FromBody] SaveBibleStudySessionRequest req)
    {
        BibleStudySession session;

        if (req.Id.HasValue)
        {
            // Update existing
            session = await _db.BibleStudySessions
                .FirstOrDefaultAsync(x => x.Id == req.Id.Value && x.UserId == UserId);
            if (session is null) return NotFound();

            session.VerseFrom = req.VerseFrom;
            session.VerseTo = req.VerseTo;
            session.Passage = req.Passage;
            session.ObservationJson = req.ObservationJson;
            session.InterpretationJson = req.InterpretationJson;
            session.ApplicationJson = req.ApplicationJson;
            session.IsCompleted = req.IsCompleted;
            session.CompletedStepsJson = req.CompletedStepsJson;
            session.ShareMode = req.ShareMode;
            session.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            // Create new
            session = new BibleStudySession
            {
                UserId = UserId,
                BookId = req.BookId,
                Chapter = req.Chapter,
                VerseFrom = req.VerseFrom,
                VerseTo = req.VerseTo,
                Passage = req.Passage,
                ObservationJson = req.ObservationJson,
                InterpretationJson = req.InterpretationJson,
                ApplicationJson = req.ApplicationJson,
                IsCompleted = req.IsCompleted,
                CompletedStepsJson = req.CompletedStepsJson,
                ShareMode = req.ShareMode,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };
            _db.BibleStudySessions.Add(session);
        }

        await _db.SaveChangesAsync();
        return Ok(ToDto(session));
    }

    // DELETE /api/bible-study-sessions/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var session = await _db.BibleStudySessions
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == UserId);

        if (session is null) return NotFound();

        _db.BibleStudySessions.Remove(session);
        await _db.SaveChangesAsync();
        return Ok();
    }

    private static BibleStudySessionDto ToDto(BibleStudySession s) => new()
    {
        Id = s.Id,
        BookId = s.BookId,
        Chapter = s.Chapter,
        VerseFrom = s.VerseFrom,
        VerseTo = s.VerseTo,
        Passage = s.Passage,
        ObservationJson = s.ObservationJson,
        InterpretationJson = s.InterpretationJson,
        ApplicationJson = s.ApplicationJson,
        IsCompleted = s.IsCompleted,
        CompletedStepsJson = s.CompletedStepsJson,
        ShareMode = s.ShareMode,
        CreatedAt = s.CreatedAt,
        UpdatedAt = s.UpdatedAt,
    };
}
