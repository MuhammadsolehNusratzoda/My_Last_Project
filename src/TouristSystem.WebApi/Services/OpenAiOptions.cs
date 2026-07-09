namespace TouristSystem.WebApi.Services;

/// <summary>
/// Strongly-typed configuration for the OpenAI Chat Completions API.
/// Bound from appsettings.json section "OpenAi".
/// </summary>
public class OpenAiOptions
{
    public string ApiKey    { get; set; } = string.Empty;
    public string Model     { get; set; } = "gpt-4o-mini";
    public int    MaxTokens { get; set; } = 800;
    public double Temperature { get; set; } = 0.7;
}
