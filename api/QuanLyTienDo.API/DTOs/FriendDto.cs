namespace QuanLyTienDo.API.DTOs;

public class FriendDto
{
    public Guid FriendshipId { get; set; }
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string AvatarColor { get; set; } = "#2196f3";
    public string Status { get; set; } = "pending";   // "pending" | "accepted" | "declined"
    public string Direction { get; set; } = "sent";   // "sent" | "received"
}

public class UserSearchDto
{
    public Guid UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string AvatarColor { get; set; } = "#2196f3";
    public string? FriendshipStatus { get; set; }     // null | "pending" | "accepted" | "declined"
    public string? Direction { get; set; }             // null | "sent" | "received"
    public Guid? FriendshipId { get; set; }
}

public class ShareSettingsDto
{
    public bool ShareTasks { get; set; }
    public bool SharePlanner { get; set; }
    public bool ShareFinanceSummary { get; set; }
}

public class CategoryAmountDto
{
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class FinanceSummaryDto
{
    public string Month { get; set; } = string.Empty;  // "yyyy-MM"
    public decimal TotalIncome { get; set; }
    public decimal TotalExpense { get; set; }
    public decimal Balance { get; set; }
    public List<CategoryAmountDto> IncomeByCategory { get; set; } = new();
    public List<CategoryAmountDto> ExpenseByCategory { get; set; } = new();
}
