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
[Route("api/fixed-expenses")]
public class FixedExpensesController : ControllerBase
{
    private readonly AppDbContext _db;

    public FixedExpensesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var list = await _db.FixedExpenses
            .Where(x => x.UserId == userId)
            .OrderBy(x => x.DayOfMonth)
            .ToListAsync();
        return Ok(list.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var fe = await _db.FixedExpenses.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (fe is null) return NotFound();
        return Ok(MapToDto(fe));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateFixedExpenseRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var fe = new FixedExpense
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = request.Title,
            Amount = request.Amount,
            Category = request.Category,
            DayOfMonth = request.DayOfMonth,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.FixedExpenses.Add(fe);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = fe.Id }, MapToDto(fe));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFixedExpenseRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var fe = await _db.FixedExpenses.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (fe is null) return NotFound();

        if (request.Title is not null) fe.Title = request.Title;
        if (request.Amount.HasValue) fe.Amount = request.Amount.Value;
        if (request.Category is not null) fe.Category = request.Category;
        if (request.DayOfMonth.HasValue) fe.DayOfMonth = request.DayOfMonth.Value;
        if (request.IsActive.HasValue) fe.IsActive = request.IsActive.Value;
        fe.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(MapToDto(fe));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var fe = await _db.FixedExpenses.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (fe is null) return NotFound();

        _db.FixedExpenses.Remove(fe);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Áp dụng khoản cố định này thành giao dịch thực tế cho tháng chỉ định
    [HttpPost("{id}/apply")]
    public async Task<IActionResult> Apply(Guid id, [FromBody] ApplyFixedExpenseRequest? request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var fe = await _db.FixedExpenses.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
        if (fe is null) return NotFound();

        var now = DateTime.UtcNow;
        var y = request?.Year ?? now.Year;
        var m = request?.Month ?? now.Month;
        // Clamp day: ví dụ ngày 31 trong tháng 4 → ngày 30
        var day = Math.Min(fe.DayOfMonth, DateTime.DaysInMonth(y, m));
        var dateStr = new DateTime(y, m, day).ToString("yyyy-MM-dd");

        var tx = new Transaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = "expense",
            Amount = fe.Amount,
            Category = fe.Category,
            Description = fe.Title,
            Date = dateStr,
            PaymentMethod = "cash",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Transactions.Add(tx);
        await _db.SaveChangesAsync();

        return Ok(new { transactionId = tx.Id, date = dateStr, title = fe.Title, amount = fe.Amount });
    }

    private static FixedExpenseDto MapToDto(FixedExpense fe) => new()
    {
        Id = fe.Id,
        UserId = fe.UserId,
        Title = fe.Title,
        Amount = fe.Amount,
        Category = fe.Category,
        DayOfMonth = fe.DayOfMonth,
        IsActive = fe.IsActive,
        CreatedAt = fe.CreatedAt,
        UpdatedAt = fe.UpdatedAt
    };
}
