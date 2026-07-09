using System;
using TouristSystem.Application.Interfaces;

namespace TouristSystem.WebApi.Services;

/// <summary>
/// Placeholder service to identify the current user context during API requests.
/// </summary>
public class CurrentUserService : ICurrentUserService
{
    public Guid? UserId => null;
}
