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
[Route("api/friends")]
public class FriendsController : ControllerBase
{
    private readonly AppDbContext _db;

    public FriendsController(AppDbContext db)
    {
        _db = db;
    }

    private Guid UserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    private async Task<bool> AreFriendsAsync(Guid userId, Guid friendId) =>
        await _db.Friendships.AnyAsync(f =>
            f.Status == "accepted" &&
            ((f.RequesterId == userId && f.AddresseeId == friendId) ||
             (f.RequesterId == friendId && f.AddresseeId == userId)));

    // GET /api/friends — danh sách bạn bè (accepted + pending)
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = UserId;

        var friendships = await _db.Friendships
            .Where(f => f.RequesterId == userId || f.AddresseeId == userId)
            .Include(f => f.Requester)
            .Include(f => f.Addressee)
            .ToListAsync();

        var result = friendships.Select(f =>
        {
            var isSender = f.RequesterId == userId;
            var other = isSender ? f.Addressee : f.Requester;
            return new FriendDto
            {
                FriendshipId = f.Id,
                UserId = other.Id,
                Username = other.Username,
                DisplayName = other.DisplayName,
                AvatarColor = other.AvatarColor,
                Status = f.Status,
                Direction = isSender ? "sent" : "received",
            };
        });

        return Ok(result);
    }

    // GET /api/friends/search?username=... — tìm user
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string username)
    {
        var userId = UserId;

        if (string.IsNullOrWhiteSpace(username) || username.Length < 2)
            return Ok(Array.Empty<UserSearchDto>());

        var users = await _db.Users
            .Where(u => u.Id != userId && u.Username.Contains(username))
            .Take(10)
            .ToListAsync();

        var userIds = users.Select(u => u.Id).ToList();

        var friendships = await _db.Friendships
            .Where(f =>
                (f.RequesterId == userId && userIds.Contains(f.AddresseeId)) ||
                (f.AddresseeId == userId && userIds.Contains(f.RequesterId)))
            .ToListAsync();

        var result = users.Select(u =>
        {
            var fs = friendships.FirstOrDefault(f =>
                (f.RequesterId == userId && f.AddresseeId == u.Id) ||
                (f.RequesterId == u.Id && f.AddresseeId == userId));

            string? direction = null;
            if (fs != null)
                direction = fs.RequesterId == userId ? "sent" : "received";

            return new UserSearchDto
            {
                UserId = u.Id,
                Username = u.Username,
                DisplayName = u.DisplayName,
                AvatarColor = u.AvatarColor,
                FriendshipStatus = fs?.Status,
                Direction = direction,
                FriendshipId = fs?.Id,
            };
        });

        return Ok(result);
    }

    // POST /api/friends/request — gửi lời mời { username }
    [HttpPost("request")]
    public async Task<IActionResult> SendRequest([FromBody] SendFriendRequestDto req)
    {
        var userId = UserId;

        var addressee = await _db.Users.FirstOrDefaultAsync(u => u.Username == req.Username);
        if (addressee == null) return NotFound("Không tìm thấy người dùng");
        if (addressee.Id == userId) return BadRequest("Không thể kết bạn với chính mình");

        var existing = await _db.Friendships.FirstOrDefaultAsync(f =>
            (f.RequesterId == userId && f.AddresseeId == addressee.Id) ||
            (f.RequesterId == addressee.Id && f.AddresseeId == userId));

        if (existing != null)
            return BadRequest("Đã có lời mời hoặc đã là bạn bè");

        var friendship = new Friendship
        {
            RequesterId = userId,
            AddresseeId = addressee.Id,
            Status = "pending",
        };
        _db.Friendships.Add(friendship);
        await _db.SaveChangesAsync();

        return Ok(new { friendship.Id });
    }

    // PUT /api/friends/{id}/accept — chấp nhận lời mời
    [HttpPut("{id:guid}/accept")]
    public async Task<IActionResult> Accept(Guid id)
    {
        var userId = UserId;
        var fs = await _db.Friendships.FindAsync(id);
        if (fs == null || fs.AddresseeId != userId) return NotFound();
        if (fs.Status == "accepted") return Ok(); // idempotent

        fs.Status = "accepted";
        fs.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok();
    }

    // PUT /api/friends/{id}/decline — từ chối lời mời
    [HttpPut("{id:guid}/decline")]
    public async Task<IActionResult> Decline(Guid id)
    {
        var userId = UserId;
        var fs = await _db.Friendships.FindAsync(id);
        if (fs == null || fs.AddresseeId != userId) return NotFound();

        fs.Status = "declined";
        fs.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok();
    }

    // DELETE /api/friends/{id} — hủy kết bạn / hủy lời mời
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Remove(Guid id)
    {
        var userId = UserId;
        var fs = await _db.Friendships.FindAsync(id);
        if (fs == null) return NotFound();
        if (fs.RequesterId != userId && fs.AddresseeId != userId) return Forbid();

        _db.Friendships.Remove(fs);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // GET /api/friends/{friendUserId}/tasks — xem tasks của bạn
    [HttpGet("{friendUserId:guid}/tasks")]
    public async Task<IActionResult> GetFriendTasks(Guid friendUserId)
    {
        var userId = UserId;
        if (!await AreFriendsAsync(userId, friendUserId)) return Forbid();

        var settings = await _db.UserShareSettings.FirstOrDefaultAsync(s => s.UserId == friendUserId);
        if (settings == null || !settings.ShareTasks)
            return Ok(new { shared = false, tasks = Array.Empty<object>() });

        var tasks = await _db.TaskItems
            .Where(t => t.UserId == friendUserId)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new {
                t.Id, t.Title, t.Description, t.Status, t.Priority,
                t.Category, t.DueDate, t.Tags, t.Steps,
            })
            .ToListAsync();

        return Ok(new { shared = true, tasks });
    }

    // GET /api/friends/{friendUserId}/planner?date= — xem planner của bạn
    [HttpGet("{friendUserId:guid}/planner")]
    public async Task<IActionResult> GetFriendPlanner(Guid friendUserId, [FromQuery] string date)
    {
        var userId = UserId;
        if (!await AreFriendsAsync(userId, friendUserId)) return Forbid();

        var settings = await _db.UserShareSettings.FirstOrDefaultAsync(s => s.UserId == friendUserId);
        if (settings == null || !settings.SharePlanner)
            return Ok(new { shared = false, items = Array.Empty<object>() });

        var items = await _db.PlannerItems
            .Where(p => p.UserId == friendUserId && p.Date == date)
            .OrderBy(p => p.Order)
            .Select(p => new {
                p.Id, p.Title, p.IsDone, p.Priority, p.EstimatedMinutes, p.Order,
            })
            .ToListAsync();

        return Ok(new { shared = true, items });
    }

    // GET /api/friends/{friendUserId}/finance-summary?month=yyyy-MM
    [HttpGet("{friendUserId:guid}/finance-summary")]
    public async Task<IActionResult> GetFriendFinanceSummary(Guid friendUserId, [FromQuery] string month)
    {
        var userId = UserId;
        if (!await AreFriendsAsync(userId, friendUserId)) return Forbid();

        var settings = await _db.UserShareSettings.FirstOrDefaultAsync(s => s.UserId == friendUserId);
        if (settings == null || !settings.ShareFinanceSummary)
            return Ok(new { shared = false });

        // Parse month "yyyy-MM" to date range
        if (!DateTime.TryParseExact(month + "-01", "yyyy-MM-dd",
            null, System.Globalization.DateTimeStyles.None, out var monthStart))
            return BadRequest("month phải có dạng yyyy-MM");

        var from = monthStart.ToString("yyyy-MM-dd");
        var to = monthStart.AddMonths(1).AddDays(-1).ToString("yyyy-MM-dd");

        var transactions = await _db.Transactions
            .Where(t => t.UserId == friendUserId &&
                        string.Compare(t.Date, from) >= 0 &&
                        string.Compare(t.Date, to) <= 0)
            .ToListAsync();

        var income = transactions.Where(t => t.Type == "income");
        var expense = transactions.Where(t => t.Type == "expense");

        var summary = new FinanceSummaryDto
        {
            Month = month,
            TotalIncome = income.Sum(t => t.Amount),
            TotalExpense = expense.Sum(t => t.Amount),
            Balance = income.Sum(t => t.Amount) - expense.Sum(t => t.Amount),
            IncomeByCategory = income
                .GroupBy(t => t.Category)
                .Select(g => new CategoryAmountDto { Category = g.Key, Amount = g.Sum(t => t.Amount) })
                .OrderByDescending(x => x.Amount)
                .ToList(),
            ExpenseByCategory = expense
                .GroupBy(t => t.Category)
                .Select(g => new CategoryAmountDto { Category = g.Key, Amount = g.Sum(t => t.Amount) })
                .OrderByDescending(x => x.Amount)
                .ToList(),
        };

        return Ok(new { shared = true, summary });
    }

    // GET /api/friends/share-settings
    [HttpGet("share-settings")]
    public async Task<IActionResult> GetShareSettings()
    {
        var userId = UserId;
        var settings = await _db.UserShareSettings.FirstOrDefaultAsync(s => s.UserId == userId);
        if (settings == null)
            return Ok(new ShareSettingsDto());

        return Ok(new ShareSettingsDto
        {
            ShareTasks = settings.ShareTasks,
            SharePlanner = settings.SharePlanner,
            ShareFinanceSummary = settings.ShareFinanceSummary,
        });
    }

    // PUT /api/friends/share-settings
    [HttpPut("share-settings")]
    public async Task<IActionResult> UpdateShareSettings([FromBody] ShareSettingsDto dto)
    {
        var userId = UserId;
        var settings = await _db.UserShareSettings.FirstOrDefaultAsync(s => s.UserId == userId);

        if (settings == null)
        {
            settings = new UserShareSettings { UserId = userId };
            _db.UserShareSettings.Add(settings);
        }

        settings.ShareTasks = dto.ShareTasks;
        settings.SharePlanner = dto.SharePlanner;
        settings.ShareFinanceSummary = dto.ShareFinanceSummary;
        settings.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok();
    }
}

// Request DTO (inline, no separate file needed)
public class SendFriendRequestDto
{
    public string Username { get; set; } = string.Empty;
}
