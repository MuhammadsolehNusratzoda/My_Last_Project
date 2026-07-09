using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Bookings.Queries.GetBookingDetail;

/// <summary>
/// Handles GetBookingDetailQuery requests, resolving reference entities and mapping results.
/// </summary>
public class GetBookingDetailQueryHandler : IRequestHandler<GetBookingDetailQuery, BookingDetailDto?>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetBookingDetailQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<BookingDetailDto?> Handle(GetBookingDetailQuery request, CancellationToken cancellationToken)
    {
        var booking = await _unitOfWork.Bookings.GetWithUserByIdAsync(request.Id, cancellationToken);

        if (booking == null)
        {
            return null;
        }

        string referenceName = "Unknown";

        if (booking.BookingType == BookingType.Hotel)
        {
            var hotel = await _unitOfWork.Hotels.GetByIdAsync(booking.ReferenceId, cancellationToken);
            if (hotel != null)
            {
                referenceName = hotel.Name;
            }
        }
        else if (booking.BookingType == BookingType.Transport)
        {
            var transport = await _unitOfWork.Transports.GetByIdAsync(booking.ReferenceId, cancellationToken);
            if (transport != null)
            {
                referenceName = transport.Name;
            }
        }
        else if (booking.BookingType == BookingType.Guide)
        {
            var guide = await _unitOfWork.Guides.GetWithUserByIdAsync(booking.ReferenceId, cancellationToken);
            if (guide != null)
            {
                referenceName = guide.User.FullName;
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
