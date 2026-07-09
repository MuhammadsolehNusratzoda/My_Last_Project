using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Interfaces;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Restaurants.Commands.DeleteRestaurant;

/// <summary>
/// Handles DeleteRestaurantCommand requests, verifying owner constraints before soft-deletion.
/// </summary>
public class DeleteRestaurantCommandHandler : IRequestHandler<DeleteRestaurantCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public DeleteRestaurantCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task Handle(DeleteRestaurantCommand request, CancellationToken cancellationToken)
    {
        var restaurant = await _unitOfWork.Restaurants.GetByIdAsync(request.Id, cancellationToken);

        if (restaurant == null)
        {
            throw new KeyNotFoundException($"Restaurant with ID '{request.Id}' was not found.");
        }

        var currentUserId = _currentUserService.UserId;
        if (currentUserId == null)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var currentUser = await _unitOfWork.Users.GetByIdAsync(currentUserId.Value, cancellationToken);
        bool isAdmin = currentUser != null && (currentUser.Role == UserRole.Admin || currentUser.Role == UserRole.SuperAdmin);

        if (restaurant.OwnerId != currentUserId.Value && !isAdmin)
        {
            throw new UnauthorizedAccessException("You are not authorized to delete this dining listing.");
        }

        _unitOfWork.Restaurants.Delete(restaurant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
