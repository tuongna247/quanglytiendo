using System.Collections.Concurrent;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using QuanLyTienDo.API.Data;
using QuanLyTienDo.API.Models;

namespace QuanLyTienDo.API.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly AppDbContext _db;
    // userId → connectionId (one active connection per user)
    private static readonly ConcurrentDictionary<Guid, string> _connections = new();

    public ChatHub(AppDbContext db)
    {
        _db = db;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = GetUserId();
        _connections[userId] = Context.ConnectionId;
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = GetUserId();
        _connections.TryRemove(userId, out _);
        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(Guid receiverId, string content)
    {
        var senderId = GetUserId();
        if (string.IsNullOrWhiteSpace(content)) return;

        var msg = new ChatMessage
        {
            SenderId = senderId,
            ReceiverId = receiverId,
            Content = content.Trim(),
        };
        _db.ChatMessages.Add(msg);
        await _db.SaveChangesAsync();

        var sender = await _db.Users.FindAsync(senderId);
        var payload = new
        {
            id = msg.Id,
            senderId = msg.SenderId,
            receiverId = msg.ReceiverId,
            content = msg.Content,
            isRead = msg.IsRead,
            createdAt = msg.CreatedAt,
            senderName = sender?.DisplayName ?? sender?.Username ?? "",
            senderAvatarColor = sender?.AvatarColor ?? "#2196f3",
        };

        // Push to receiver if online
        if (_connections.TryGetValue(receiverId, out var connId))
            await Clients.Client(connId).SendAsync("ReceiveMessage", payload);

        // Confirm to sender
        await Clients.Caller.SendAsync("ReceiveMessage", payload);
    }

    public async Task MarkRead(Guid senderId)
    {
        var receiverId = GetUserId();
        var unread = _db.ChatMessages
            .Where(m => m.SenderId == senderId && m.ReceiverId == receiverId && !m.IsRead);
        foreach (var m in unread) m.IsRead = true;
        await _db.SaveChangesAsync();
    }

    public async Task Typing(Guid receiverId)
    {
        var senderId = GetUserId();
        if (_connections.TryGetValue(receiverId, out var connId))
            await Clients.Client(connId).SendAsync("UserTyping", senderId);
    }

    private Guid GetUserId() =>
        Guid.Parse(Context.User!.FindFirst(ClaimTypes.NameIdentifier)!.Value);
}
