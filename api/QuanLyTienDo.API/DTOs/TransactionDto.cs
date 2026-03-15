namespace QuanLyTienDo.API.DTOs;

public class TransactionDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Type { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Date { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = "cash";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateTransactionRequest
{
    public string Type { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Date { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = "cash";
}

public class UpdateTransactionRequest
{
    public string? Type { get; set; }
    public decimal? Amount { get; set; }
    public string? Category { get; set; }
    public string? Description { get; set; }
    public string? Date { get; set; }
    public string? PaymentMethod { get; set; }
}
