using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
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

        if (booking.BookingType == BookingType.Hotel)
        {
            var hotel = await _unitOfWork.Hotels.GetByIdAsync(booking.ReferenceId, cancellationToken);
            if (hotel != null)
            {
                hotel.AvailableRooms += booking.Quantity;
                _unitOfWork.Hotels.Update(hotel);
            }
        }
        else if (booking.BookingType == BookingType.Transport)
        {
            var transport = await _unitOfWork.Transports.GetByIdAsync(booking.ReferenceId, cancellationToken);
            if (transport != null)
            {
                transport.AvailableSeats += booking.Quantity;
                _unitOfWork.Transports.Update(transport);
            }
        }
        else if (booking.BookingType == BookingType.Guide)
        {
            var guide = await _unitOfWork.Guides.GetByIdAsync(booking.ReferenceId, cancellationToken);
            if (guide != null)
            {
                guide.IsAvailable = true;
                _unitOfWork.Guides.Update(guide);
            }
        }

        booking.Status = BookingStatus.Cancelled;
        booking.CancelledAt = DateTime.UtcNow;

        _unitOfWork.Bookings.Update(booking);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
