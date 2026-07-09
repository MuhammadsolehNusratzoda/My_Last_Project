using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Interfaces;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Transports.Commands.DeleteTransport;

/// <summary>
/// Handles DeleteTransportCommand requests, enforcing ownership boundaries before soft-deletion.
/// </summary>
public class DeleteTransportCommandHandler : IRequestHandler<DeleteTransportCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public DeleteTransportCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task Handle(DeleteTransportCommand request, CancellationToken cancellationToken)
    {
        var transport = await _unitOfWork.Transports.GetByIdAsync(request.Id, cancellationToken);

        if (transport == null)
        {
            throw new KeyNotFoundException($"Transport vehicle with ID '{request.Id}' was not found.");
        }

        var currentUserId = _currentUserService.UserId;
        if (currentUserId == null)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var currentUser = await _unitOfWork.Users.GetByIdAsync(currentUserId.Value, cancellationToken);
        bool isAdmin = currentUser != null && (currentUser.Role == UserRole.Admin || currentUser.Role == UserRole.SuperAdmin);

        if (transport.OwnerId != currentUserId.Value && !isAdmin)
        {
            throw new UnauthorizedAccessException("You are not authorized to delete this transport listing.");
        }

        _unitOfWork.Transports.Delete(transport);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
