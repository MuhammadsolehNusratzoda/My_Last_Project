using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Common.Models;
using TouristSystem.Application.Interfaces;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Partner.Queries;

/// <summary>
/// Paged bookings of the current partner.
/// From/To are calendar dates (Dushanbe); a booking matches if its stay overlaps the range.
/// </summary>
public record GetPartnerBookingsQuery(
    string? Status = null,
    DateOnly? From = null,
    DateOnly? To = null,
    string? Search = null,
    int PageNumber = 1,
    int PageSize = 20) : IRequest<PagedList<PartnerBookingListItemDto>>;

public class GetPartnerBookingsQueryHandler : IRequestHandler<GetPartnerBookingsQuery, PagedList<PartnerBookingListItemDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public GetPartnerBookingsQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<PagedList<PartnerBookingListItemDto>> Handle(GetPartnerBookingsQuery request, CancellationToken cancellationToken)
    {
        var partner = await PartnerContext.GetCurrentPartnerAsync(_currentUserService, _unitOfWork, cancellationToken);

        BookingStatus? status = null;
        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (!Enum.TryParse<BookingStatus>(request.Status, true, out var parsed))
            {
                throw new ArgumentException($"Unknown booking status '{request.Status}'.");
            }
            status = parsed;
        }

        var pageNumber = request.PageNumber < 1 ? 1 : request.PageNumber;
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        DateTime? fromUtc = request.From.HasValue ? ToUtc(request.From.Value) : null;
        DateTime? toUtc = request.To.HasValue ? ToUtc(request.To.Value.AddDays(1)) : null; // inclusive "to" date

        var (items, total) = await _unitOfWork.Bookings.GetPartnerPagedAsync(
            partner.Id, status, fromUtc, toUtc, request.Search, pageNumber, pageSize, cancellationToken);

        var lookup = await PartnerContext.BuildListingLookupAsync(_unitOfWork, partner, cancellationToken);

        var dtos = items.Select(b => new PartnerBookingListItemDto(
            b.Id,
            b.BookingType.ToString(),
            b.ReferenceId,
            lookup.TryGetValue(b.ReferenceId, out var l) ? l.Name : "—",
            b.User.FullName,
            b.User.Email,
            b.User.PhoneNumber,
            b.StartDate,
            b.EndDate,
            PartnerContext.Nights(b.StartDate, b.EndDate),
            b.GuestsCount,
            b.Quantity,
            b.TotalPrice,
            b.Status.ToString(),
            b.IsNoShow,
            b.CreatedAt)).ToList();

        return new PagedList<PartnerBookingListItemDto>(dtos, total, pageNumber, pageSize);
    }

    private static DateTime ToUtc(DateOnly localDate) =>
        DateTime.SpecifyKind(localDate.ToDateTime(TimeOnly.MinValue) - PartnerContext.DushanbeOffset, DateTimeKind.Utc);
}
