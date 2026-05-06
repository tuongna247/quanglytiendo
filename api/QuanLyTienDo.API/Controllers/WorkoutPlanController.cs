using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyTienDo.API.Data;
using QuanLyTienDo.API.DTOs;
using QuanLyTienDo.API.Models;

namespace QuanLyTienDo.API.Controllers;

[Authorize]
[ApiController]
[Route("api/workout-plan")]
public class WorkoutPlanController : ControllerBase
{
    private readonly AppDbContext _db;
    public WorkoutPlanController(AppDbContext db) { _db = db; }

    private Guid UserId => Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet("active")]
    public async Task<IActionResult> GetActive()
    {
        var plan = await _db.UserWorkoutPlans
            .FirstOrDefaultAsync(p => p.UserId == UserId && p.Status == "active");
        return Ok(plan is null ? null : MapPlan(plan));
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory()
    {
        var plans = await _db.UserWorkoutPlans
            .Where(p => p.UserId == UserId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
        return Ok(plans.Select(MapPlan));
    }

    [HttpPost]
    public async Task<IActionResult> StartPlan([FromBody] StartPlanRequest req)
    {
        var existing = await _db.UserWorkoutPlans
            .FirstOrDefaultAsync(p => p.UserId == UserId && p.Status == "active");
        if (existing is not null)
            return Conflict(new { message = "Bạn đang có một giáo án đang chạy. Hãy hoàn thành hoặc bỏ trước." });

        var plan = new UserWorkoutPlan
        {
            Id = Guid.NewGuid(),
            UserId = UserId,
            PlanId = req.PlanId,
            PlanName = req.PlanName,
            DurationDays = req.DurationDays,
            StartDate = req.StartDate,
            Status = "active",
            CompletedDaysJson = "[]",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.UserWorkoutPlans.Add(plan);
        await _db.SaveChangesAsync();
        return Ok(MapPlan(plan));
    }

    [HttpPost("{id}/complete-day")]
    public async Task<IActionResult> CompleteDay(Guid id, [FromBody] CompleteDayRequest req)
    {
        var plan = await _db.UserWorkoutPlans
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == UserId);
        if (plan is null) return NotFound();

        var completedDays = JsonSerializer.Deserialize<List<int>>(plan.CompletedDaysJson) ?? [];
        if (completedDays.Contains(req.DayIndex))
            return Ok(MapPlan(plan));

        // Create WorkoutSession for this day
        var session = new WorkoutSession
        {
            Id = Guid.NewGuid(),
            UserId = UserId,
            Date = DateTime.UtcNow.ToString("yyyy-MM-dd"),
            Name = req.SessionName,
            Source = "plan",
            DurationMinutes = req.DurationMinutes,
            CaloriesBurned = req.CaloriesBurned,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        _db.WorkoutSessions.Add(session);

        for (int i = 0; i < req.Exercises.Count; i++)
        {
            var exReq = req.Exercises[i];
            var exercise = new WorkoutExercise
            {
                Id = Guid.NewGuid(),
                SessionId = session.Id,
                Name = exReq.Name,
                MuscleGroup = exReq.MuscleGroup,
                OrderIndex = i,
            };
            _db.WorkoutExercises.Add(exercise);

            foreach (var setReq in exReq.Sets)
            {
                _db.WorkoutSets.Add(new WorkoutSet
                {
                    Id = Guid.NewGuid(),
                    ExerciseId = exercise.Id,
                    SetNumber = setReq.SetNumber,
                    Reps = setReq.Reps,
                    WeightKg = setReq.WeightKg,
                    DurationSeconds = setReq.DurationSeconds,
                });
            }
        }

        completedDays.Add(req.DayIndex);
        plan.CompletedDaysJson = JsonSerializer.Serialize(completedDays);
        plan.UpdatedAt = DateTime.UtcNow;

        if (completedDays.Count >= plan.DurationDays)
            plan.Status = "completed";

        await _db.SaveChangesAsync();
        return Ok(MapPlan(plan));
    }

    [HttpDelete("{id}/complete-day/{dayIndex}")]
    public async Task<IActionResult> UndoDay(Guid id, int dayIndex)
    {
        var plan = await _db.UserWorkoutPlans
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == UserId);
        if (plan is null) return NotFound();

        var completedDays = JsonSerializer.Deserialize<List<int>>(plan.CompletedDaysJson) ?? [];
        completedDays.Remove(dayIndex);
        plan.CompletedDaysJson = JsonSerializer.Serialize(completedDays);
        plan.Status = "active";
        plan.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(MapPlan(plan));
    }

    [HttpPost("{id}/abandon")]
    public async Task<IActionResult> Abandon(Guid id)
    {
        var plan = await _db.UserWorkoutPlans
            .FirstOrDefaultAsync(p => p.Id == id && p.UserId == UserId);
        if (plan is null) return NotFound();
        plan.Status = "abandoned";
        plan.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(MapPlan(plan));
    }

    private static WorkoutPlanDto MapPlan(UserWorkoutPlan p) => new()
    {
        Id = p.Id,
        PlanId = p.PlanId,
        PlanName = p.PlanName,
        DurationDays = p.DurationDays,
        StartDate = p.StartDate,
        Status = p.Status,
        CompletedDays = JsonSerializer.Deserialize<List<int>>(p.CompletedDaysJson) ?? [],
        CreatedAt = p.CreatedAt,
    };
}
