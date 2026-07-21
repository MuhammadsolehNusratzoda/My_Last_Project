using MediatR;
using Microsoft.AspNetCore.Http;

namespace TouristSystem.Application.Features.Users.Commands.UploadProfilePhoto;

/// <summary>
/// Command to upload or replace the currently authenticated user's profile photo.
/// </summary>
public record UploadProfilePhotoCommand(Guid UserId, IFormFile File) : IRequest<string>;
