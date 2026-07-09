using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Interfaces;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Hotels.Commands.DeleteHotel;

/// <summary>
/// Handles DeleteHotelCommand requests, enforcing ownership constraints before soft-deletion.
/// </summary>
public class DeleteHotelCommandHandler : IRequestHandler<DeleteHotelCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public DeleteHotelCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task Handle(DeleteHotelCommand request, CancellationToken cancellationToken)
    {
        var hotel = await _unitOfWork.Hotels.GetByIdAsync(request.Id, cancellationToken);

        if (hotel == null)
        {
            throw new KeyNotFoundException($"Hotel with ID '{request.Id}' was not found.");
        }

        var currentUserId = _currentUserService.UserId;
        if (currentUserId == null)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var currentUser = await _unitOfWork.Users.GetByIdAsync(currentUserId.Value, cancellationToken);
        bool isAdmin = currentUser != null && (currentUser.Role == UserRole.Admin || currentUser.Role == UserRole.SuperAdmin);

        if (hotel.OwnerId != currentUserId.Value && !isAdmin)
        {
            throw new UnauthorizedAccessException("You are not authorized to delete this lodging listing.");
        }

        _unitOfWork.Hotels.Delete(hotel);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
