using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyTienDo.API.Data;
using QuanLyTienDo.API.Models;

namespace QuanLyTienDo.API.Controllers;

[Authorize]
[ApiController]
[Route("api/bible-highlights")]
public class BibleHighlightController : ControllerBase
{
    private readonly AppDbContext _db;
    public BibleHighlightController(AppDbContext db) { _db = db; }

    private Guid UserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    // GET /api/bible-highlights?book=gn&chapter=1
    // Returns: { "1:3": "#FFF176", "2:5": "#FF0000" }
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string book, [FromQuery] int chapter)
    {
        var row = await _db.BibleVerseHighlights
            .FirstOrDefaultAsync(x => x.UserId == UserId && x.BookId == book && x.Chapter == chapter);
        if (row is null) return Ok(new { });
        try
        {
            var data = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(row.HighlightJson);
            return Ok(data ?? new Dictionary<string, string>());
        }
        catch { return Ok(new { }); }
    }

    // PUT /api/bible-highlights
    // Body: { "bookId": "gn", "chapter": 1, "highlights": { "1:3": "#FFF176" } }
    [HttpPut]
    public async Task<IActionResult> Save([FromBody] SaveHighlightRequest req)
    {
        var json = System.Text.Json.JsonSerializer.Serialize(req.Highlights ?? new Dictionary<string, string>());
        var row = await _db.BibleVerseHighlights
            .FirstOrDefaultAsync(x => x.UserId == UserId && x.BookId == req.BookId && x.Chapter == req.Chapter);

        if (row is null)
        {
            _db.BibleVerseHighlights.Add(new BibleVerseHighlight
            {
                UserId = UserId,
                BookId = req.BookId,
                Chapter = req.Chapter,
                HighlightJson = json,
                UpdatedAt = DateTime.UtcNow
            });
        }
        else
        {
            row.HighlightJson = json;
            row.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return Ok();
    }
}

public record SaveHighlightRequest(string BookId, int Chapter, Dictionary<string, string>? Highlights);
