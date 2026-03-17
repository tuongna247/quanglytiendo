using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyTienDo.API.Data;
using QuanLyTienDo.API.Models;

namespace QuanLyTienDo.API.Controllers;

[Authorize]
[ApiController]
[Route("api/ebook")]
public class EbookController : ControllerBase
{
    private readonly AppDbContext _db;
    public EbookController(AppDbContext db) { _db = db; }

    private Guid UserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    // ── Books ──────────────────────────────────────────────────────────────────

    [HttpGet("books")]
    public async Task<IActionResult> GetBooks()
    {
        var uid = UserId;
        var books = await _db.EbookBooks
            .Where(x => x.UserId == uid)
            .OrderByDescending(x => x.UploadedAt)
            .Select(x => new {
                id = x.Id,
                userId = x.UserId,
                title = x.Title,
                totalPages = x.TotalPages,
                uploadedAt = x.UploadedAt,
            })
            .ToListAsync();
        return Ok(books);
    }

    [HttpGet("books/{id}")]
    public async Task<IActionResult> GetBook(Guid id)
    {
        var uid = UserId;
        var book = await _db.EbookBooks
            .Where(x => x.Id == id && x.UserId == uid)
            .FirstOrDefaultAsync();
        if (book is null) return NotFound();
        var pages = JsonSerializer.Deserialize<List<string>>(book.PagesJson) ?? new();
        return Ok(new { id = book.Id, userId = book.UserId, title = book.Title, pages, totalPages = book.TotalPages, uploadedAt = book.UploadedAt });
    }

    [HttpPost("books")]
    public async Task<IActionResult> SaveBook([FromBody] SaveBookRequest req)
    {
        var uid = UserId;
        var pagesJson = JsonSerializer.Serialize(req.Pages);
        var book = new EbookBook
        {
            UserId = uid,
            Title = req.Title,
            PagesJson = pagesJson,
            TotalPages = req.Pages.Count,
            UploadedAt = DateTime.UtcNow,
        };
        _db.EbookBooks.Add(book);
        await _db.SaveChangesAsync();
        return Ok(new { id = book.Id, userId = book.UserId, title = book.Title, pages = req.Pages, totalPages = book.TotalPages, uploadedAt = book.UploadedAt });
    }

    [HttpDelete("books/{id}")]
    public async Task<IActionResult> DeleteBook(Guid id)
    {
        var uid = UserId;
        var book = await _db.EbookBooks.FirstOrDefaultAsync(x => x.Id == id && x.UserId == uid);
        if (book is null) return NotFound();
        _db.EbookBooks.Remove(book);
        await _db.SaveChangesAsync();
        return Ok();
    }

    // ── Highlights ─────────────────────────────────────────────────────────────

    [HttpGet("books/{bookId}/highlights")]
    public async Task<IActionResult> GetHighlights(Guid bookId)
    {
        var uid = UserId;
        var items = await _db.EbookHighlights
            .Where(x => x.BookId == bookId && x.UserId == uid)
            .OrderBy(x => x.CreatedAt)
            .Select(x => new { id = x.Id, userId = x.UserId, bookId = x.BookId, pageNumber = x.PageNumber, startOffset = x.StartOffset, endOffset = x.EndOffset, text = x.Text, color = x.Color, createdAt = x.CreatedAt })
            .ToListAsync();
        return Ok(items);
    }

    [HttpPost("highlights")]
    public async Task<IActionResult> AddHighlight([FromBody] AddHighlightRequest req)
    {
        var uid = UserId;
        var h = new EbookHighlight
        {
            UserId = uid,
            BookId = req.BookId,
            PageNumber = req.PageNumber,
            StartOffset = req.StartOffset,
            EndOffset = req.EndOffset,
            Text = req.Text,
            Color = req.Color,
            CreatedAt = DateTime.UtcNow,
        };
        _db.EbookHighlights.Add(h);
        await _db.SaveChangesAsync();
        return Ok(new { id = h.Id, userId = h.UserId, bookId = h.BookId, pageNumber = h.PageNumber, startOffset = h.StartOffset, endOffset = h.EndOffset, text = h.Text, color = h.Color, createdAt = h.CreatedAt });
    }

    [HttpDelete("highlights/{id}")]
    public async Task<IActionResult> DeleteHighlight(Guid id)
    {
        var uid = UserId;
        var h = await _db.EbookHighlights.FirstOrDefaultAsync(x => x.Id == id && x.UserId == uid);
        if (h is null) return NotFound();
        _db.EbookHighlights.Remove(h);
        await _db.SaveChangesAsync();
        return Ok();
    }

    // ── Comments ───────────────────────────────────────────────────────────────

    [HttpGet("books/{bookId}/comments")]
    public async Task<IActionResult> GetComments(Guid bookId)
    {
        var uid = UserId;
        var items = await _db.EbookComments
            .Where(x => x.BookId == bookId && x.UserId == uid)
            .OrderBy(x => x.CreatedAt)
            .Select(x => new { id = x.Id, userId = x.UserId, bookId = x.BookId, pageNumber = x.PageNumber, highlightId = x.HighlightId, startOffset = x.StartOffset, endOffset = x.EndOffset, selectedText = x.SelectedText, content = x.Content, createdAt = x.CreatedAt, updatedAt = x.UpdatedAt })
            .ToListAsync();
        return Ok(items);
    }

    [HttpPost("comments")]
    public async Task<IActionResult> AddComment([FromBody] AddCommentRequest req)
    {
        var uid = UserId;
        var c = new EbookComment
        {
            UserId = uid,
            BookId = req.BookId,
            PageNumber = req.PageNumber,
            HighlightId = req.HighlightId,
            StartOffset = req.StartOffset,
            EndOffset = req.EndOffset,
            SelectedText = req.SelectedText,
            Content = req.Content,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.EbookComments.Add(c);
        await _db.SaveChangesAsync();
        return Ok(new { id = c.Id, userId = c.UserId, bookId = c.BookId, pageNumber = c.PageNumber, highlightId = c.HighlightId, startOffset = c.StartOffset, endOffset = c.EndOffset, selectedText = c.SelectedText, content = c.Content, createdAt = c.CreatedAt, updatedAt = c.UpdatedAt });
    }

    [HttpPut("comments/{id}")]
    public async Task<IActionResult> UpdateComment(Guid id, [FromBody] UpdateCommentRequest req)
    {
        var uid = UserId;
        var c = await _db.EbookComments.FirstOrDefaultAsync(x => x.Id == id && x.UserId == uid);
        if (c is null) return NotFound();
        c.Content = req.Content;
        c.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { id = c.Id, content = c.Content, updatedAt = c.UpdatedAt });
    }

    [HttpDelete("comments/{id}")]
    public async Task<IActionResult> DeleteComment(Guid id)
    {
        var uid = UserId;
        var c = await _db.EbookComments.FirstOrDefaultAsync(x => x.Id == id && x.UserId == uid);
        if (c is null) return NotFound();
        _db.EbookComments.Remove(c);
        await _db.SaveChangesAsync();
        return Ok();
    }

    // ── Bookmarks ──────────────────────────────────────────────────────────────

    [HttpGet("books/{bookId}/bookmarks")]
    public async Task<IActionResult> GetBookmarks(Guid bookId)
    {
        var uid = UserId;
        var items = await _db.EbookBookmarks
            .Where(x => x.BookId == bookId && x.UserId == uid)
            .OrderBy(x => x.PageNumber)
            .Select(x => new { id = x.Id, userId = x.UserId, bookId = x.BookId, pageNumber = x.PageNumber, label = x.Label, createdAt = x.CreatedAt })
            .ToListAsync();
        return Ok(items);
    }

    [HttpPost("bookmarks")]
    public async Task<IActionResult> AddBookmark([FromBody] AddBookmarkRequest req)
    {
        var uid = UserId;
        // Remove existing bookmark for this page if any
        var existing = await _db.EbookBookmarks.FirstOrDefaultAsync(x => x.BookId == req.BookId && x.UserId == uid && x.PageNumber == req.PageNumber);
        if (existing is not null)
        {
            _db.EbookBookmarks.Remove(existing);
            await _db.SaveChangesAsync();
            return Ok(new { removed = true });
        }
        var b = new EbookBookmark
        {
            UserId = uid,
            BookId = req.BookId,
            PageNumber = req.PageNumber,
            Label = req.Label ?? $"Trang {req.PageNumber}",
            CreatedAt = DateTime.UtcNow,
        };
        _db.EbookBookmarks.Add(b);
        await _db.SaveChangesAsync();
        return Ok(new { id = b.Id, userId = b.UserId, bookId = b.BookId, pageNumber = b.PageNumber, label = b.Label, createdAt = b.CreatedAt });
    }

    [HttpDelete("bookmarks/{id}")]
    public async Task<IActionResult> DeleteBookmark(Guid id)
    {
        var uid = UserId;
        var b = await _db.EbookBookmarks.FirstOrDefaultAsync(x => x.Id == id && x.UserId == uid);
        if (b is null) return NotFound();
        _db.EbookBookmarks.Remove(b);
        await _db.SaveChangesAsync();
        return Ok();
    }

    // ── Progress ───────────────────────────────────────────────────────────────

    [HttpGet("books/{bookId}/progress")]
    public async Task<IActionResult> GetProgress(Guid bookId)
    {
        var uid = UserId;
        var p = await _db.EbookProgresses.FirstOrDefaultAsync(x => x.BookId == bookId && x.UserId == uid);
        if (p is null) return Ok(new { currentPage = 1 });
        return Ok(new { id = p.Id, userId = p.UserId, bookId = p.BookId, currentPage = p.CurrentPage, lastReadAt = p.LastReadAt });
    }

    [HttpPut("books/{bookId}/progress")]
    public async Task<IActionResult> UpdateProgress(Guid bookId, [FromBody] UpdateProgressRequest req)
    {
        var uid = UserId;
        var p = await _db.EbookProgresses.FirstOrDefaultAsync(x => x.BookId == bookId && x.UserId == uid);
        if (p is null)
        {
            p = new EbookProgress { UserId = uid, BookId = bookId, CurrentPage = req.CurrentPage, LastReadAt = DateTime.UtcNow };
            _db.EbookProgresses.Add(p);
        }
        else
        {
            p.CurrentPage = req.CurrentPage;
            p.LastReadAt = DateTime.UtcNow;
        }
        await _db.SaveChangesAsync();
        return Ok(new { currentPage = p.CurrentPage });
    }
}

// ── Request DTOs ───────────────────────────────────────────────────────────────
public record SaveBookRequest(string Title, List<string> Pages);
public record AddHighlightRequest(Guid BookId, int PageNumber, int StartOffset, int EndOffset, string Text, string Color);
public record AddCommentRequest(Guid BookId, int PageNumber, Guid? HighlightId, int StartOffset, int EndOffset, string SelectedText, string Content);
public record UpdateCommentRequest(string Content);
public record AddBookmarkRequest(Guid BookId, int PageNumber, string? Label);
public record UpdateProgressRequest(int CurrentPage);
