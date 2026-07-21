using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Users.Commands.UpdateProfile;

/// <summary>
/// Handles updating a user's profile details (name, phone).
/// </summary>
public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, UpdateProfileResponse>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateProfileCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<UpdateProfileResponse> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
            throw new KeyNotFoundException("User not found.");

        user.FullName = request.FullName;
        user.PhoneNumber = request.PhoneNumber;
        _unitOfWork.Users.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new UpdateProfileResponse(
            user.Id,
            user.FullName,
            user.Email,
            user.PhoneNumber,
            user.ProfileImageUrl,
            user.Role.ToString());
    }
}
