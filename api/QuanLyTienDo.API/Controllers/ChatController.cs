using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyTienDo.API.Data;

namespace QuanLyTienDo.API.Controllers;

[Authorize]
[ApiController]
[Route("api/chat")]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _db;
    public ChatController(AppDbContext db) { _db = db; }

    private Guid UserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    // GET /api/chat/history/{friendId}?page=1
    [HttpGet("history/{friendId:guid}")]
    public async Task<IActionResult> GetHistory(Guid friendId, [FromQuery] int page = 1)
    {
        var userId = UserId;
        const int pageSize = 50;

        var messages = await _db.ChatMessages
            .Where(m =>
                (m.SenderId == userId && m.ReceiverId == friendId) ||
                (m.SenderId == friendId && m.ReceiverId == userId))
            .OrderByDescending(m => m.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new
            {
                m.Id,
                m.SenderId,
                m.ReceiverId,
                m.Content,
                m.IsRead,
                m.CreatedAt,
            })
            .ToListAsync();

        // Mark incoming messages as read
        var unread = await _db.ChatMessages
            .Where(m => m.SenderId == friendId && m.ReceiverId == userId && !m.IsRead)
            .ToListAsync();
        foreach (var m in unread) m.IsRead = true;
        if (unread.Count > 0) await _db.SaveChangesAsync();

        return Ok(messages.OrderBy(m => m.CreatedAt));
    }

    // GET /api/chat/conversations — last message với mỗi người
    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var userId = UserId;

        // Lấy tất cả messages liên quan đến userId
        var allMessages = await _db.ChatMessages
            .Where(m => m.SenderId == userId || m.ReceiverId == userId)
            .Include(m => m.Sender)
            .Include(m => m.Receiver)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();

        // Group by conversation partner
        var conversations = allMessages
            .GroupBy(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
            .Select(g =>
            {
                var last = g.First();
                var partner = last.SenderId == userId ? last.Receiver : last.Sender;
                var unreadCount = g.Count(m => m.ReceiverId == userId && !m.IsRead);
                return new
                {
                    partnerId = partner.Id,
                    partnerName = partner.DisplayName,
                    partnerUsername = partner.Username,
                    partnerAvatarColor = partner.AvatarColor,
                    lastMessage = last.Content,
                    lastMessageAt = last.CreatedAt,
                    unreadCount,
                };
            })
            .OrderByDescending(c => c.lastMessageAt)
            .ToList();

        return Ok(conversations);
    }

    // GET /api/chat/unread-count
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = UserId;
        var count = await _db.ChatMessages
            .CountAsync(m => m.ReceiverId == userId && !m.IsRead);
        return Ok(new { count });
    }

    // PUT /api/chat/read/{friendId} — mark all as read
    [HttpPut("read/{friendId:guid}")]
    public async Task<IActionResult> MarkRead(Guid friendId)
    {
        var userId = UserId;
        var unread = await _db.ChatMessages
            .Where(m => m.SenderId == friendId && m.ReceiverId == userId && !m.IsRead)
            .ToListAsync();
        foreach (var m in unread) m.IsRead = true;
        await _db.SaveChangesAsync();
        return Ok();
    }
}
