using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Common.Models;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Bookings.Queries.GetBookingsList;

/// <summary>
/// Handles GetBookingsListQuery requests, returning mapped paged lists of Bookings.
/// </summary>
public class GetBookingsListQueryHandler : IRequestHandler<GetBookingsListQuery, PagedList<BookingsListDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetBookingsListQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedList<BookingsListDto>> Handle(GetBookingsListQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _unitOfWork.Bookings.GetPagedAsync(
            request.UserId,
            request.BookingType,
            request.BookingStatus,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        var dtos = items.Select(x => new BookingsListDto(
            x.Id,
            x.UserId,
            x.User.FullName,
            x.BookingType.ToString(),
            x.ReferenceId,
            x.StartDate,
            x.EndDate,
            x.GuestsCount,
            x.Quantity,
            x.TotalPrice,
            x.Status.ToString(),
            x.CreatedAt
        )).ToList();

        return new PagedList<BookingsListDto>(dtos, totalCount, request.PageNumber, request.PageSize);
    }
}
