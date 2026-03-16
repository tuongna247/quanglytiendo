using SendGrid;
using SendGrid.Helpers.Mail;

namespace QuanLyTienDo.API.Services;

public interface IEmailService
{
    Task SendPasswordResetAsync(string toEmail, string toName, string resetLink);
}

public class SendGridEmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<SendGridEmailService> _logger;

    public SendGridEmailService(IConfiguration config, ILogger<SendGridEmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendPasswordResetAsync(string toEmail, string toName, string resetLink)
    {
        var apiKey = _config["SendGrid:ApiKey"]!;
        var fromEmail = _config["SendGrid:FromEmail"]!;
        var fromName = _config["SendGrid:FromName"] ?? "Quản Lý Tiến Độ";

        var client = new SendGridClient(apiKey);
        var msg = new SendGridMessage
        {
            From = new EmailAddress(fromEmail, fromName),
            Subject = "Đặt lại mật khẩu",
            HtmlContent = $"""
                <p>Xin chào <strong>{toName}</strong>,</p>
                <p>Bạn vừa yêu cầu đặt lại mật khẩu. Nhấn vào link bên dưới (có hiệu lực trong 15 phút):</p>
                <p><a href="{resetLink}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Đặt lại mật khẩu</a></p>
                <p>Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.</p>
                """
        };
        msg.AddTo(new EmailAddress(toEmail, toName));

        var response = await client.SendEmailAsync(msg);
        if (!response.IsSuccessStatusCode)
            _logger.LogError("SendGrid error: {Status}", response.StatusCode);
    }
}
