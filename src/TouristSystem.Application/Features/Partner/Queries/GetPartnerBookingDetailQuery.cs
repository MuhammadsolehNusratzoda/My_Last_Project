using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Interfaces;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Partner.Queries;

/// <summary>Full details of one booking of the current partner (404 if it belongs to someone else).</summary>
public record GetPartnerBookingDetailQuery(Guid Id) : IRequest<PartnerBookingDetailDto?>;

public class GetPartnerBookingDetailQueryHandler : IRequestHandler<GetPartnerBookingDetailQuery, PartnerBookingDetailDto?>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public GetPartnerBookingDetailQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<PartnerBookingDetailDto?> Handle(GetPartnerBookingDetailQuery request, CancellationToken cancellationToken)
    {
        var partner = await PartnerContext.GetCurrentPartnerAsync(_currentUserService, _unitOfWork, cancellationToken);

        var booking = await _unitOfWork.Bookings.GetForPartnerAsync(request.Id, partner.Id, cancellationToken);
        if (booking == null)
        {
            return null;
        }

        var lookup = await PartnerContext.BuildListingLookupAsync(_unitOfWork, partner, cancellationToken);
        lookup.TryGetValue(booking.ReferenceId, out var listing);

        var historyRows = await _unitOfWork.BookingStatusHistories.GetByBookingIdAsync(booking.Id, cancellationToken);
        var names = new Dictionary<Guid, string>();
        var history = new List<BookingHistoryItemDto>();
        foreach (var row in historyRows)
        {
            var changedBy = "System";
            if (row.ChangedByUserId.HasValue)
            {
                if (!names.TryGetValue(row.ChangedByUserId.Value, out var name))
                {
                    var user = await _unitOfWork.Users.GetByIdAsync(row.ChangedByUserId.Value, cancellationToken);
                    name = user?.FullName ?? "Unknown user";
                    names[row.ChangedByUserId.Value] = name;
                }
                changedBy = name;
            }

            history.Add(new BookingHistoryItemDto(
                row.FromStatus.ToString(), row.ToStatus.ToString(), changedBy, row.Reason, row.ChangedAt));
        }

        return new PartnerBookingDetailDto(
            booking.Id,
            booking.BookingType.ToString(),
            booking.ReferenceId,
            listing.Name ?? "—",
            listing.City,
            booking.User.FullName,
            booking.User.Email,
            booking.User.PhoneNumber,
            booking.StartDate,
            booking.EndDate,
            PartnerContext.Nights(booking.StartDate, booking.EndDate),
            booking.GuestsCount,
            booking.Quantity,
            booking.TotalPrice,
            booking.Status.ToString(),
            booking.Notes,
            booking.RejectionReason,
            booking.IsNoShow,
            booking.CreatedAt,
            booking.ConfirmedAt,
            booking.CancelledAt,
            booking.CompletedAt,
            history);
    }
}
