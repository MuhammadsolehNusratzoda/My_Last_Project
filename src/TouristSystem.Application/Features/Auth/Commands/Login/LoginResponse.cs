using System;

namespace TouristSystem.Application.Features.Auth.Commands.Login;

/// <summary>
/// Response payload returning user credentials and JWT details.
/// </summary>
public record LoginResponse(
    Guid UserId,
    string FullName,
    string Email,
    string Role,
    string? PhoneNumber,
    string? ProfileImageUrl,
    string Token);
