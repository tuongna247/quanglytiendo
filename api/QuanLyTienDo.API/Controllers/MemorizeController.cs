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
[Route("api/memorize")]
public class MemorizeController : ControllerBase
{
    private readonly AppDbContext _db;
    public MemorizeController(AppDbContext db) { _db = db; }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var items = await _db.MemorizePassages
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.AddedAt)
            .ToListAsync();
        return Ok(items.Select(MapToDto));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMemorizePassageRequest req)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var item = new MemorizePassage
        {
            UserId = userId,
            Reference = req.Reference,
            ParsedJson = req.ParsedJson,
            MasteredJson = req.MasteredJson,
            AddedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.MemorizePassages.Add(item);
        await _db.SaveChangesAsync();
        return Ok(MapToDto(item));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMastered(Guid id, [FromBody] UpdateMemorizeMasteredRequest req)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var item = await _db.MemorizePassages.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (item is null) return NotFound();
        item.MasteredJson = req.MasteredJson;
        item.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(MapToDto(item));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var item = await _db.MemorizePassages.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (item is null) return NotFound();
        _db.MemorizePassages.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static MemorizePassageDto MapToDto(MemorizePassage x) => new()
    {
        Id = x.Id,
        Reference = x.Reference,
        ParsedJson = x.ParsedJson,
        MasteredJson = x.MasteredJson,
        AddedAt = x.AddedAt,
        UpdatedAt = x.UpdatedAt
    };
}
