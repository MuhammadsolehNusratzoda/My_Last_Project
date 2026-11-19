using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Common.Models;
using TouristSystem.Application.Interfaces;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Bookings.Queries.GetBookingsList;

/// <summary>
/// Handles GetBookingsListQuery requests, returning mapped paged lists of Bookings.
/// </summary>
public class GetBookingsListQueryHandler : IRequestHandler<GetBookingsListQuery, PagedList<BookingsListDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public GetBookingsListQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<PagedList<BookingsListDto>> Handle(GetBookingsListQuery request, CancellationToken cancellationToken)
    {
        // SECURITY: the visible scope is decided from the JWT, never from the query string.
        var currentUserId = _currentUserService.UserId
            ?? throw new UnauthorizedAccessException("User is not authenticated.");

        var currentUser = await _unitOfWork.Users.GetByIdAsync(currentUserId, cancellationToken);
        var role = currentUser?.Role ?? UserRole.Tourist;

        Guid? userIdFilter;
        IReadOnlyCollection<Guid>? referenceIds = null;

        if (role == UserRole.Admin || role == UserRole.SuperAdmin)
        {
            // Admins may see everything, optionally filtered by a specific user
            userIdFilter = request.UserId;
        }
        else if (request.UserId == currentUserId)
        {
            // "My bookings" — any role may list the bookings they made as a traveler
            userIdFilter = currentUserId;
        }
        else if (role == UserRole.HotelOwner || role == UserRole.TransportOwner ||
                 role == UserRole.Guide || role == UserRole.RestaurantOwner)
        {
            // Partner view — only bookings made for the partner's own listings
            userIdFilter = null;
            referenceIds = await GetOwnedReferenceIdsAsync(role, currentUserId, cancellationToken);
        }
        else
        {
            // Tourists (and anyone else) only ever see their own bookings
            userIdFilter = currentUserId;
        }

        var (items, totalCount) = await _unitOfWork.Bookings.GetPagedAsync(
            userIdFilter,
            request.BookingType,
            request.BookingStatus,
            request.PageNumber,
            request.PageSize,
            cancellationToken,
            referenceIds);

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

    private async Task<IReadOnlyCollection<Guid>> GetOwnedReferenceIdsAsync(
        UserRole role, Guid ownerId, CancellationToken cancellationToken)
    {
        switch (role)
        {
            case UserRole.HotelOwner:
                return await _unitOfWork.Hotels.GetIdsByOwnerAsync(ownerId, cancellationToken);

            case UserRole.TransportOwner:
                return await _unitOfWork.Transports.GetIdsByOwnerAsync(ownerId, cancellationToken);

            case UserRole.Guide:
                var guide = await _unitOfWork.Guides.GetByUserIdAsync(ownerId, cancellationToken);
                return guide != null ? new[] { guide.Id } : Array.Empty<Guid>();

            default:
                // RestaurantOwner: restaurants have no bookings yet (BookingType has no Restaurant)
                return Array.Empty<Guid>();
        }
    }
}
