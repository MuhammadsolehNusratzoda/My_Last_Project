using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Interfaces;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Bookings.Queries.GetBookingDetail;

/// <summary>
/// Handles GetBookingDetailQuery requests, resolving reference entities and mapping results.
/// </summary>
public class GetBookingDetailQueryHandler : IRequestHandler<GetBookingDetailQuery, BookingDetailDto?>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public GetBookingDetailQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<BookingDetailDto?> Handle(GetBookingDetailQuery request, CancellationToken cancellationToken)
    {
        var booking = await _unitOfWork.Bookings.GetWithUserByIdAsync(request.Id, cancellationToken);

        if (booking == null)
        {
            return null;
        }

        string referenceName = "Unknown";
        Guid? partnerUserId = null; // owner of the referenced listing

        if (booking.BookingType == BookingType.Hotel)
        {
            var hotel = await _unitOfWork.Hotels.GetByIdAsync(booking.ReferenceId, cancellationToken);
            if (hotel != null)
            {
                referenceName = hotel.Name;
                partnerUserId = hotel.OwnerId;
            }
        }
        else if (booking.BookingType == BookingType.Transport)
        {
            var transport = await _unitOfWork.Transports.GetByIdAsync(booking.ReferenceId, cancellationToken);
            if (transport != null)
            {
                referenceName = transport.Name;
                partnerUserId = transport.OwnerId;
            }
        }
        else if (booking.BookingType == BookingType.Guide)
        {
            var guide = await _unitOfWork.Guides.GetWithUserByIdAsync(booking.ReferenceId, cancellationToken);
            if (guide != null)
            {
                referenceName = guide.User.FullName;
                partnerUserId = guide.UserId;
            }
        }

        // SECURITY: only the traveler, the listing owner or an admin may see a booking.
        // Anyone else gets "not found" (null → 404) so the booking's existence is not revealed.
        var currentUserId = _currentUserService.UserId;
        if (currentUserId == null)
        {
            return null;
        }

        bool isTraveler = booking.UserId == currentUserId.Value;
        bool isPartner = partnerUserId == currentUserId.Value;
        if (!isTraveler && !isPartner)
        {
            var currentUser = await _unitOfWork.Users.GetByIdAsync(currentUserId.Value, cancellationToken);
            bool isAdmin = currentUser != null &&
                           (currentUser.Role == UserRole.Admin || currentUser.Role == UserRole.SuperAdmin);
            if (!isAdmin)
            {
                return null;
            }
        }

        return new BookingDetailDto(
            booking.Id,
            booking.UserId,
            booking.User.FullName,
            booking.User.Email,
            booking.BookingType.ToString(),
            booking.ReferenceId,
            referenceName,
            booking.StartDate,
            booking.EndDate,
            booking.GuestsCount,
            booking.Quantity,
            booking.TotalPrice,
            booking.Status.ToString(),
            booking.Notes,
            booking.ConfirmedAt,
            booking.CancelledAt,
            booking.CreatedAt);
    }
}
