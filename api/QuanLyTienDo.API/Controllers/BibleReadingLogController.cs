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
[Route("api/bible-reading-log")]
public class BibleReadingLogController : ControllerBase
{
    private readonly AppDbContext _db;
    public BibleReadingLogController(AppDbContext db) { _db = db; }

    // GET /api/bible-reading-log — returns list of completed date strings
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var dates = await _db.BibleReadingLogs
            .Where(x => x.UserId == userId)
            .Select(x => x.Date)
            .ToListAsync();
        return Ok(dates);
    }

    // POST /api/bible-reading-log — toggle completed for a date
    [HttpPost]
    public async Task<IActionResult> Toggle([FromBody] ToggleBibleReadingLogRequest req)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var existing = await _db.BibleReadingLogs
            .FirstOrDefaultAsync(x => x.UserId == userId && x.Date == req.Date);

        if (req.Completed && existing is null)
        {
            _db.BibleReadingLogs.Add(new BibleReadingLog
            {
                UserId = userId,
                Date = req.Date,
                CreatedAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();
        }
        else if (!req.Completed && existing is not null)
        {
            _db.BibleReadingLogs.Remove(existing);
            await _db.SaveChangesAsync();
        }

        return Ok();
    }
}
