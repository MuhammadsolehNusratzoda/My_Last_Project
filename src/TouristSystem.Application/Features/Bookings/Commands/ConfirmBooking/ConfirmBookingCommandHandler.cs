using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Interfaces;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Bookings.Commands.ConfirmBooking;

/// <summary>
/// Handles ConfirmBookingCommand requests, verifying owner permissions and saving.
/// </summary>
public class ConfirmBookingCommandHandler : IRequestHandler<ConfirmBookingCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public ConfirmBookingCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task Handle(ConfirmBookingCommand request, CancellationToken cancellationToken)
    {
        var booking = await _unitOfWork.Bookings.GetByIdAsync(request.Id, cancellationToken);

        if (booking == null)
        {
            throw new KeyNotFoundException($"Booking with ID '{request.Id}' was not found.");
        }

        if (booking.Status != BookingStatus.Pending)
        {
            throw new InvalidOperationException("Only Pending bookings can be confirmed.");
        }

        var currentUserId = _currentUserService.UserId;
        if (currentUserId == null)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var currentUser = await _unitOfWork.Users.GetByIdAsync(currentUserId.Value, cancellationToken);
        bool isAdmin = currentUser != null && (currentUser.Role == UserRole.Admin || currentUser.Role == UserRole.SuperAdmin);

        bool isAuthorizedOwner = false;

        if (booking.BookingType == BookingType.Hotel)
        {
            var hotel = await _unitOfWork.Hotels.GetByIdAsync(booking.ReferenceId, cancellationToken);
            if (hotel != null && hotel.OwnerId == currentUserId.Value)
            {
                isAuthorizedOwner = true;
            }
        }
        else if (booking.BookingType == BookingType.Transport)
        {
            var transport = await _unitOfWork.Transports.GetByIdAsync(booking.ReferenceId, cancellationToken);
            if (transport != null && transport.OwnerId == currentUserId.Value)
            {
                isAuthorizedOwner = true;
            }
        }
        else if (booking.BookingType == BookingType.Guide)
        {
            var guide = await _unitOfWork.Guides.GetByIdAsync(booking.ReferenceId, cancellationToken);
            if (guide != null && guide.UserId == currentUserId.Value)
            {
                isAuthorizedOwner = true;
            }
        }

        if (!isAuthorizedOwner && !isAdmin)
        {
            throw new UnauthorizedAccessException("You are not authorized to confirm this booking reservation.");
        }

        booking.Status = BookingStatus.Confirmed;
        booking.ConfirmedAt = DateTime.UtcNow;

        _unitOfWork.Bookings.Update(booking);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
