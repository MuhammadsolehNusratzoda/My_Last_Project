using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Interfaces;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Guides.Commands.UpdateGuide;

/// <summary>
/// Handles UpdateGuideCommand requests, enforcing authorization checks.
/// </summary>
public class UpdateGuideCommandHandler : IRequestHandler<UpdateGuideCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public UpdateGuideCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task Handle(UpdateGuideCommand request, CancellationToken cancellationToken)
    {
        var guide = await _unitOfWork.Guides.GetByIdAsync(request.Id, cancellationToken);

        if (guide == null)
        {
            throw new KeyNotFoundException($"Guide profile with ID '{request.Id}' was not found.");
        }

        var currentUserId = _currentUserService.UserId;
        if (currentUserId == null)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var currentUser = await _unitOfWork.Users.GetByIdAsync(currentUserId.Value, cancellationToken);
        bool isAdmin = currentUser != null && (currentUser.Role == UserRole.Admin || currentUser.Role == UserRole.SuperAdmin);

        if (guide.UserId != currentUserId.Value && !isAdmin)
        {
            throw new UnauthorizedAccessException("You are not authorized to edit this guide profile.");
        }

        guide.Bio = request.Bio;
        guide.Languages = request.Languages;
        guide.City = request.City;
        guide.PricePerDay = request.PricePerDay;
        guide.ExperienceYears = request.ExperienceYears;
        guide.ImageUrl = request.ImageUrl;
        guide.IsAvailable = request.IsAvailable;

        if (Enum.TryParse<EntityStatus>(request.Status, true, out var status))
        {
            guide.Status = status;
        }

        _unitOfWork.Guides.Update(guide);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
