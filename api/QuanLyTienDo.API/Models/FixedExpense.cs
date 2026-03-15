namespace QuanLyTienDo.API.Models;

public class FixedExpense
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;      // "Tiền học của con"
    public string Type { get; set; } = "expense";          // "income" | "expense"
    public decimal Amount { get; set; }
    public string Category { get; set; } = string.Empty;
    public int DayOfMonth { get; set; }                    // ngày trong tháng (1-31)
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User User { get; set; } = null!;
    public ICollection<FixedExpenseApplication> Applications { get; set; } = new List<FixedExpenseApplication>();
}
