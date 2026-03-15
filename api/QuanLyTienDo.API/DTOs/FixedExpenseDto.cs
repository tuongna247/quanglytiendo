namespace QuanLyTienDo.API.DTOs;

public class FixedExpenseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = "expense";
    public decimal Amount { get; set; }
    public string Category { get; set; } = string.Empty;
    public int DayOfMonth { get; set; }
    public bool IsActive { get; set; }
    public bool IsAppliedThisMonth { get; set; }
    public List<ApplicationHistoryDto> Archives { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class ApplicationHistoryDto
{
    public Guid Id { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public Guid TransactionId { get; set; }
    public DateTime AppliedAt { get; set; }
}

public class CreateFixedExpenseRequest
{
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = "expense";
    public decimal Amount { get; set; }
    public string Category { get; set; } = string.Empty;
    public int DayOfMonth { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateFixedExpenseRequest
{
    public string? Title { get; set; }
    public string? Type { get; set; }
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
