using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Interfaces;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Partner.Queries;

/// <summary>KPIs and today's arrivals for the current partner.</summary>
public record GetPartnerSummaryQuery : IRequest<PartnerSummaryDto>;

public class GetPartnerSummaryQueryHandler : IRequestHandler<GetPartnerSummaryQuery, PartnerSummaryDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public GetPartnerSummaryQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<PartnerSummaryDto> Handle(GetPartnerSummaryQuery request, CancellationToken cancellationToken)
    {
        var partner = await PartnerContext.GetCurrentPartnerAsync(_currentUserService, _unitOfWork, cancellationToken);
        var lookup = await PartnerContext.BuildListingLookupAsync(_unitOfWork, partner, cancellationToken);

        var todayStart = PartnerContext.TodayStartUtc();
        var since30 = DateTime.UtcNow.AddDays(-30);

        var pending = await _unitOfWork.Bookings.CountForPartnerAsync(partner.Id, BookingStatus.Pending, cancellationToken);
        var confirmed = await _unitOfWork.Bookings.CountForPartnerAsync(partner.Id, BookingStatus.Confirmed, cancellationToken);
        var completed30 = await _unitOfWork.Bookings.CountPartnerChangedToAsync(partner.Id, BookingStatus.Completed, since30, cancellationToken);
        var cancelled30 = await _unitOfWork.Bookings.CountPartnerChangedToAsync(partner.Id, BookingStatus.Cancelled, since30, cancellationToken);

        var arrivals = await _unitOfWork.Bookings.GetPartnerArrivalsAsync(partner.Id, todayStart, todayStart.AddDays(1), cancellationToken);
        var arrivalDtos = arrivals.Select(b => new PartnerArrivalDto(
            b.Id,
            b.User.FullName,
            b.User.PhoneNumber,
            lookup.TryGetValue(b.ReferenceId, out var l) ? l.Name : "—",
            b.BookingType.ToString(),
            b.StartDate,
            b.EndDate,
            b.GuestsCount,
            b.Quantity)).ToList();

        return new PartnerSummaryDto(pending, confirmed, completed30, cancelled30, lookup.Count, arrivalDtos, DateTime.UtcNow);
    }
}
