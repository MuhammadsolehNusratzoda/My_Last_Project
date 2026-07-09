namespace TouristSystem.Infrastructure.Authentication;

/// <summary>
/// Strongly-typed option binding class for JWT token parameters.
/// </summary>
public class JwtOptions
{
    public string Issuer { get; init; } = string.Empty;
    public string Audience { get; init; } = string.Empty;
    public string SecretKey { get; init; } = string.Empty;
    public int ExpiryInMinutes { get; init; }
}
