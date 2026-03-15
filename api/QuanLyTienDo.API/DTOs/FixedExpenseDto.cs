namespace QuanLyTienDo.API.DTOs;

public class FixedExpenseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Category { get; set; } = string.Empty;
    public int DayOfMonth { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateFixedExpenseRequest
{
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Category { get; set; } = string.Empty;
    public int DayOfMonth { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateFixedExpenseRequest
{
    public string? Title { get; set; }
    public decimal? Amount { get; set; }
    public string? Category { get; set; }
    public int? DayOfMonth { get; set; }
    public bool? IsActive { get; set; }
}

public class ApplyFixedExpenseRequest
{
    public int? Year { get; set; }
    public int? Month { get; set; }
}
