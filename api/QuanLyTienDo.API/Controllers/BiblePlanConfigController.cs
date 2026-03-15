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
[Route("api/bible-plan-config")]
public class BiblePlanConfigController : ControllerBase
{
    private readonly AppDbContext _db;
    public BiblePlanConfigController(AppDbContext db) { _db = db; }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var config = await _db.UserBiblePlanConfigs.FirstOrDefaultAsync(x => x.UserId == userId);
        if (config is null) return NotFound();
        return Ok(MapToDto(config));
    }

    [HttpPost]
    public async Task<IActionResult> Save([FromBody] SaveBiblePlanConfigRequest req)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var existing = await _db.UserBiblePlanConfigs.FirstOrDefaultAsync(x => x.UserId == userId);

        if (existing is not null)
        {
            existing.Type = req.Type;
            existing.Duration = req.Duration;
            existing.StartDate = req.StartDate;
            existing.StartWeekOverride = req.StartWeekOverride;
            existing.GeneratedPlanJson = req.GeneratedPlanJson;
            existing.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            _db.UserBiblePlanConfigs.Add(new UserBiblePlanConfig
            {
                UserId = userId,
                Type = req.Type,
                Duration = req.Duration,
                StartDate = req.StartDate,
                StartWeekOverride = req.StartWeekOverride,
                GeneratedPlanJson = req.GeneratedPlanJson,
                UpdatedAt = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync();
        var saved = await _db.UserBiblePlanConfigs.FirstAsync(x => x.UserId == userId);
        return Ok(MapToDto(saved));
    }

    private static BiblePlanConfigDto MapToDto(UserBiblePlanConfig x) => new()
    {
        Type = x.Type,
        Duration = x.Duration,
        StartDate = x.StartDate,
        StartWeekOverride = x.StartWeekOverride,
        GeneratedPlanJson = x.GeneratedPlanJson,
        UpdatedAt = x.UpdatedAt
    };
}
