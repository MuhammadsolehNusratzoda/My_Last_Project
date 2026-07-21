using System;
using System.Security.Claims;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TouristSystem.Application.Features.Users.Commands.DeleteProfilePhoto;
using TouristSystem.Application.Features.Users.Commands.UpdateProfile;
using TouristSystem.Application.Features.Users.Commands.UploadProfilePhoto;

namespace TouristSystem.WebApi.Controllers;

/// <summary>
/// API endpoints for managing user profile details and profile photo.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly ISender _sender;

    public UsersController(ISender sender)
    {
        _sender = sender;
    }

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(claim) || !Guid.TryParse(claim, out var id))
            throw new UnauthorizedAccessException("Invalid user identity.");
        return id;
    }

    /// <summary>
    /// Upload or replace the current user's profile photo.
    /// </summary>
    [HttpPost("profile-photo")]
    public async Task<IActionResult> UploadProfilePhoto(IFormFile file)
    {
        var userId = GetCurrentUserId();
        var url = await _sender.Send(new UploadProfilePhotoCommand(userId, file));
        return Ok(new { profileImageUrl = url });
    }

    /// <summary>
    /// Delete the current user's profile photo.
    /// </summary>
    [HttpDelete("profile-photo")]
    public async Task<IActionResult> DeleteProfilePhoto()
    {
        var userId = GetCurrentUserId();
        await _sender.Send(new DeleteProfilePhotoCommand(userId));
        return NoContent();
    }

    /// <summary>
    /// Update the current user's profile details (fullName, phoneNumber).
    /// </summary>
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userId = GetCurrentUserId();
        var response = await _sender.Send(new UpdateProfileCommand(userId, dto.FullName, dto.PhoneNumber));
        return Ok(response);
    }
}

/// <summary>
/// Data contract for updating user profile details.
/// </summary>
public record UpdateProfileDto(string FullName, string? PhoneNumber);
