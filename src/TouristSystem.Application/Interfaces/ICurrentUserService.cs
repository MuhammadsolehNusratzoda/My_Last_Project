using System;

namespace TouristSystem.Application.Interfaces;

/// <summary>
/// Service contract to fetch identity information of the currently authenticated user session.
/// </summary>
public interface ICurrentUserService
{
    Guid? UserId { get; }
}
