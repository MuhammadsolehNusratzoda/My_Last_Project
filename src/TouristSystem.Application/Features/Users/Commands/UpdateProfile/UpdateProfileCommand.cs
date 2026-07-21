using MediatR;

namespace TouristSystem.Application.Features.Users.Commands.UpdateProfile;

/// <summary>
/// Command to update the current user's profile details (fullName, phoneNumber).
/// </summary>
public record UpdateProfileCommand(Guid UserId, string FullName, string? PhoneNumber) : IRequest<UpdateProfileResponse>;

/// <summary>
/// Response after updating profile details.
/// </summary>
public record UpdateProfileResponse(
    Guid Id,
    string FullName,
    string Email,
    string? PhoneNumber,
    string? ProfileImageUrl,
    string Role);
