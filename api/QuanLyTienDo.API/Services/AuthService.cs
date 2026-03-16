using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QuanLyTienDo.API.Data;
using QuanLyTienDo.API.DTOs;
using QuanLyTienDo.API.Models;

namespace QuanLyTienDo.API.Services;

public interface IAuthService
{
    Task<AuthResponse> Register(RegisterRequest request);
    Task<AuthResponse?> Login(LoginRequest request);
    string GenerateJwtToken(User user);
    Task ForgotPassword(ForgotPasswordRequest request);
    Task ResetPassword(ResetPasswordRequest request);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    private readonly IEmailService _email;

    public AuthService(AppDbContext db, IConfiguration config, IEmailService email)
    {
        _db = db;
        _config = config;
        _email = email;
    }

    public async Task<AuthResponse> Register(RegisterRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Username == request.Username))
            throw new InvalidOperationException("Username already taken.");

        if (!string.IsNullOrEmpty(request.Email) && await _db.Users.AnyAsync(u => u.Email == request.Email))
            throw new InvalidOperationException("Email already taken.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = request.Username,
            DisplayName = request.DisplayName,
            Email = string.IsNullOrEmpty(request.Email) ? null : request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            AvatarColor = request.AvatarColor,
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = GenerateJwtToken(user);
        var expiryDays = _config.GetValue<int>("Jwt:ExpiryDays", 7);

        return new AuthResponse
        {
            Token = token,
            UserId = user.Id,
            Username = user.Username,
            DisplayName = user.DisplayName,
            AvatarColor = user.AvatarColor,
            ExpiresAt = DateTime.UtcNow.AddDays(expiryDays)
        };
    }

    public async Task<AuthResponse?> Login(LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user is null)
            return null;

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        var token = GenerateJwtToken(user);
        var expiryDays = _config.GetValue<int>("Jwt:ExpiryDays", 7);

        return new AuthResponse
        {
            Token = token,
            UserId = user.Id,
            Username = user.Username,
            DisplayName = user.DisplayName,
            AvatarColor = user.AvatarColor,
            ExpiresAt = DateTime.UtcNow.AddDays(expiryDays)
        };
    }

    public string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiryDays = _config.GetValue<int>("Jwt:ExpiryDays", 7);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("username", user.Username),
            new Claim("displayName", user.DisplayName)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(expiryDays),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task ForgotPassword(ForgotPasswordRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        // Không tiết lộ email có tồn tại hay không
        if (user is null) return;

        // Xóa token cũ chưa dùng
        var old = _db.PasswordResetTokens.Where(t => t.UserId == user.Id && !t.Used);
        _db.PasswordResetTokens.RemoveRange(old);

        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        _db.PasswordResetTokens.Add(new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            Used = false,
        });
        await _db.SaveChangesAsync();

        var appUrl = _config["App:Url"]!;
        var resetLink = $"{appUrl}/reset-password?token={token}";
        await _email.SendPasswordResetAsync(user.Email!, user.DisplayName, resetLink);
    }

    public async Task ResetPassword(ResetPasswordRequest request)
    {
        var entry = await _db.PasswordResetTokens
            .FirstOrDefaultAsync(t => t.Token == request.Token && !t.Used);

        if (entry is null || entry.ExpiresAt < DateTime.UtcNow)
            throw new InvalidOperationException("Token không hợp lệ hoặc đã hết hạn.");

        var user = await _db.Users.FindAsync(entry.UserId)
            ?? throw new InvalidOperationException("Người dùng không tồn tại.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        entry.Used = true;
        await _db.SaveChangesAsync();
    }
}
