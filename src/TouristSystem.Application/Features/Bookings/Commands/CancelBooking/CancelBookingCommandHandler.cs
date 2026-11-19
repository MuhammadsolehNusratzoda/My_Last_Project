using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Features.Bookings.Common;
using TouristSystem.Application.Interfaces;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Bookings.Commands.CancelBooking;

/// <summary>
/// Handles CancelBookingCommand requests, updating booking states and restoring capacities.
/// </summary>
public class CancelBookingCommandHandler : IRequestHandler<CancelBookingCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public CancelBookingCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task Handle(CancelBookingCommand request, CancellationToken cancellationToken)
    {
        var booking = await _unitOfWork.Bookings.GetByIdAsync(request.Id, cancellationToken);

        if (booking == null)
        {
            throw new KeyNotFoundException($"Booking with ID '{request.Id}' was not found.");
        }

        if (booking.Status == BookingStatus.Cancelled)
        {
            throw new InvalidOperationException("This booking is already cancelled.");
        }

        var currentUserId = _currentUserService.UserId;
        if (currentUserId == null)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var currentUser = await _unitOfWork.Users.GetByIdAsync(currentUserId.Value, cancellationToken);
        bool isAdmin = currentUser != null && (currentUser.Role == UserRole.Admin || currentUser.Role == UserRole.SuperAdmin);

        if (booking.UserId != currentUserId.Value && !isAdmin)
        {
            throw new UnauthorizedAccessException("You are not authorized to cancel this booking.");
        }

        // Expired/Completed bookings no longer hold capacity
        if (booking.Status == BookingStatus.Pending || booking.Status == BookingStatus.Confirmed)
        {
            await BookingWorkflow.ReleaseCapacityAsync(_unitOfWork, booking, cancellationToken);
        }

        await BookingWorkflow.ChangeStatusAsync(_unitOfWork, booking, BookingStatus.Cancelled, currentUserId.Value, "Cancelled by traveler", cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
