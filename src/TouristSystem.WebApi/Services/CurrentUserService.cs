using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using TouristSystem.Application.Interfaces;

namespace TouristSystem.WebApi.Services;

/// <summary>
/// Resolves the authenticated user's ID from the JWT of the current HTTP request.
/// Returns null for anonymous requests and outside of a request (e.g. background services).
/// </summary>
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId
    {
        get
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user?.Identity?.IsAuthenticated != true)
            {
                return null;
            }

            // JwtBearer maps "sub" to ClaimTypes.NameIdentifier by default; support both forms.
            var value = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub");
            return Guid.TryParse(value, out var id) ? id : null;
        }
    }
}
