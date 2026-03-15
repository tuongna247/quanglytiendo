namespace QuanLyTienDo.API.Models;

public class FixedExpenseApplication
{
    public Guid Id { get; set; }
    public Guid FixedExpenseId { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public Guid TransactionId { get; set; }
    public DateTime AppliedAt { get; set; }

    public FixedExpense FixedExpense { get; set; } = null!;
}
