namespace QuanLyTienDo.API.DTOs;

public class TaskItemDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = "todo";
    public string Priority { get; set; } = "medium";
    public string Category { get; set; } = "general";
    public string? DueDate { get; set; }
    public string Steps { get; set; } = "[]";
    public string Tags { get; set; } = "[]";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateTaskRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Status { get; set; } = "todo";
    public string Priority { get; set; } = "medium";
    public string Category { get; set; } = "general";
    public string? DueDate { get; set; }
    public string Steps { get; set; } = "[]";
    public string Tags { get; set; } = "[]";
}

public class UpdateTaskRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; }
    public string? Priority { get; set; }
    public string? Category { get; set; }
    public string? DueDate { get; set; }
    public string? Steps { get; set; }
    public string? Tags { get; set; }
}
