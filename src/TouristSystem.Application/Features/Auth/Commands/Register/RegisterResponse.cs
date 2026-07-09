using System;

namespace TouristSystem.Application.Features.Auth.Commands.Register;

/// <summary>
/// Response payload returning registration metadata and an access token.
/// </summary>
public record RegisterResponse(
    Guid UserId,
    string FullName,
    string Email,
    string Token);
