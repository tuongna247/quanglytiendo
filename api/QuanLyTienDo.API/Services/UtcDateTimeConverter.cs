using System.Text.Json;
using System.Text.Json.Serialization;

namespace QuanLyTienDo.API.Services;

/// <summary>
/// Ensures all DateTime values from JSON bodies are treated as UTC,
/// preventing Npgsql "Kind=Unspecified" errors with timestamp with time zone columns.
/// </summary>
public class UtcDateTimeConverter : JsonConverter<DateTime>
{
    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var dt = reader.GetDateTime();
        return DateTime.SpecifyKind(dt, DateTimeKind.Utc);
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(DateTime.SpecifyKind(value, DateTimeKind.Utc).ToString("yyyy-MM-ddTHH:mm:ss.fffZ"));
    }
}
