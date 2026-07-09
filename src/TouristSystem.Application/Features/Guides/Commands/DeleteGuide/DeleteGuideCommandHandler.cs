using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Interfaces;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Guides.Commands.DeleteGuide;

/// <summary>
/// Handles DeleteGuideCommand requests, enforcing ownership constraints before soft-deletion.
/// </summary>
public class DeleteGuideCommandHandler : IRequestHandler<DeleteGuideCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public DeleteGuideCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task Handle(DeleteGuideCommand request, CancellationToken cancellationToken)
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
            throw new UnauthorizedAccessException("You are not authorized to delete this guide profile.");
        }

        _unitOfWork.Guides.Delete(guide);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
