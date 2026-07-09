using TouristSystem.Domain.Entities;

namespace TouristSystem.Application.Interfaces;

/// <summary>
/// Service contract to generate JWT authorization signatures.
/// </summary>
public interface IJwtProvider
{
    string Generate(User user);
}
