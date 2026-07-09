using BCrypt.Net;
using TouristSystem.Application.Interfaces;

namespace TouristSystem.Infrastructure.Authentication;

/// <summary>
/// Cryptographic password hashing provider implementing the BCrypt algorithm.
/// </summary>
public class PasswordHasher : IPasswordHasher
{
    public string Hash(string password) => BCrypt.Net.BCrypt.HashPassword(password);

    public bool Verify(string password, string passwordHash) => BCrypt.Net.BCrypt.Verify(password, passwordHash);
}
