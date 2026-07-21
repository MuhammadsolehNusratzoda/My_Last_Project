using MediatR;

namespace TouristSystem.Application.Features.Users.Commands.DeleteProfilePhoto;

/// <summary>
/// Command to delete the currently authenticated user's profile photo.
/// </summary>
public record DeleteProfilePhotoCommand(Guid UserId) : IRequest;
