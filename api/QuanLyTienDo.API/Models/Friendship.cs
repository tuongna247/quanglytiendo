namespace QuanLyTienDo.API.Models;

public class Friendship
{
    public Guid Id { get; set; }
    public Guid RequesterId { get; set; }   // người gửi lời mời
    public Guid AddresseeId { get; set; }   // người nhận
    public string Status { get; set; } = "pending"; // "pending" | "accepted" | "declined"
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User Requester { get; set; } = null!;
    public User Addressee { get; set; } = null!;
}
