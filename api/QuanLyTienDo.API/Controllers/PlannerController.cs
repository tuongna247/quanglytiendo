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
[Route("api/planner")]
public class PlannerController : ControllerBase
{
    private readonly AppDbContext _db;

    public PlannerController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("range")]
    public async Task<IActionResult> GetRange([FromQuery] string from, [FromQuery] string to)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var items = await _db.PlannerItems
            .Where(p => p.UserId == userId && string.Compare(p.Date, from) >= 0 && string.Compare(p.Date, to) <= 0)
            .OrderBy(p => p.Date).ThenBy(p => p.Order)
            .ToListAsync();
        return Ok(items.Select(MapToDto));
    }

    [HttpGet]
    public async Task<IActionResult> GetByDate([FromQuery] string date)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var items = await _db.PlannerItems
            .Where(p => p.UserId == userId && p.Date == date)
            .OrderBy(p => p.Order)
            .ToListAsync();

        return Ok(items.Select(MapToDto));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePlannerItemRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var item = new PlannerItem
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Date = request.Date,
            Order = request.Order,
            Title = request.Title,
            Notes = request.Notes,
            IsDone = false,
            EstimatedMinutes = request.EstimatedMinutes,
            LinkedTaskId = request.LinkedTaskId,
            LinkedEventId = request.LinkedEventId,
            Priority = request.Priority,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.PlannerItems.Add(item);
        await _db.SaveChangesAsync();

        return Ok(MapToDto(item));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePlannerItemRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var item = await _db.PlannerItems.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (item is null) return NotFound();

        if (request.Title is not null) item.Title = request.Title;
        if (request.Notes is not null) item.Notes = request.Notes;
        if (request.Priority is not null) item.Priority = request.Priority;
        if (request.Order.HasValue) item.Order = request.Order.Value;
        if (request.EstimatedMinutes.HasValue) item.EstimatedMinutes = request.EstimatedMinutes;
        if (request.LinkedTaskId.HasValue) item.LinkedTaskId = request.LinkedTaskId;
        if (request.LinkedEventId.HasValue) item.LinkedEventId = request.LinkedEventId;
        if (request.IsDone.HasValue)
        {
            item.IsDone = request.IsDone.Value;
            item.CompletedAt = request.IsDone.Value ? DateTime.UtcNow : null;
        }
        item.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(MapToDto(item));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var item = await _db.PlannerItems.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

        if (item is null) return NotFound();

        _db.PlannerItems.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("reorder")]
    public async Task<IActionResult> Reorder([FromBody] List<ReorderRequest> reorders)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var ids = reorders.Select(r => r.Id).ToList();
        var items = await _db.PlannerItems
            .Where(p => p.UserId == userId && ids.Contains(p.Id))
            .ToListAsync();

        foreach (var item in items)
        {
            var reorder = reorders.FirstOrDefault(r => r.Id == item.Id);
            if (reorder is not null)
            {
                item.Order = reorder.Order;
                item.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _db.SaveChangesAsync();
        return Ok();
    }

    private static PlannerItemDto MapToDto(PlannerItem p) => new()
    {
        Id = p.Id,
        UserId = p.UserId,
        Date = p.Date,
        Order = p.Order,
        Title = p.Title,
        Notes = p.Notes,
        IsDone = p.IsDone,
        CompletedAt = p.CompletedAt,
        EstimatedMinutes = p.EstimatedMinutes,
        LinkedTaskId = p.LinkedTaskId,
        LinkedEventId = p.LinkedEventId,
        Priority = p.Priority,
        CreatedAt = p.CreatedAt,
        UpdatedAt = p.UpdatedAt
    };
}
