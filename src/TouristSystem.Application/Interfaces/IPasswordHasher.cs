namespace TouristSystem.Application.Interfaces;

/// <summary>
/// Service contract to hash and verify plain text credentials.
/// </summary>
public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string passwordHash);
}
