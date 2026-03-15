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
[Route("api/transactions")]
public class TransactionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public TransactionsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? from, [FromQuery] string? to)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var query = _db.Transactions.Where(t => t.UserId == userId);

        if (!string.IsNullOrEmpty(from))
            query = query.Where(t => string.Compare(t.Date, from) >= 0);

        if (!string.IsNullOrEmpty(to))
            query = query.Where(t => string.Compare(t.Date, to) <= 0);

        var transactions = await query.OrderByDescending(t => t.Date).ToListAsync();
        return Ok(transactions.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var tx = await _db.Transactions.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (tx is null) return NotFound();

        return Ok(MapToDto(tx));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTransactionRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var tx = new Transaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = request.Type,
            Amount = request.Amount,
            Category = request.Category,
            Description = request.Description,
            Date = request.Date,
            PaymentMethod = request.PaymentMethod,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Transactions.Add(tx);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = tx.Id }, MapToDto(tx));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTransactionRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var tx = await _db.Transactions.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (tx is null) return NotFound();

        if (request.Type is not null) tx.Type = request.Type;
        if (request.Amount.HasValue) tx.Amount = request.Amount.Value;
        if (request.Category is not null) tx.Category = request.Category;
        if (request.Description is not null) tx.Description = request.Description;
        if (request.Date is not null) tx.Date = request.Date;
        if (request.PaymentMethod is not null) tx.PaymentMethod = request.PaymentMethod;
        tx.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(MapToDto(tx));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var tx = await _db.Transactions.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (tx is null) return NotFound();

        _db.Transactions.Remove(tx);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static TransactionDto MapToDto(Transaction t) => new()
    {
        Id = t.Id,
        UserId = t.UserId,
        Type = t.Type,
        Amount = t.Amount,
        Category = t.Category,
        Description = t.Description,
        Date = t.Date,
        PaymentMethod = t.PaymentMethod,
        CreatedAt = t.CreatedAt,
        UpdatedAt = t.UpdatedAt
    };
}
