using System;
using MediatR;
using TouristSystem.Application.Common.Models;

namespace TouristSystem.Application.Features.Bookings.Queries.GetBookingsList;

/// <summary>
/// CQRS request record to fetch a paginated list of bookings/reservations with filters.
/// </summary>
public record GetBookingsListQuery(
    Guid? UserId = null,
    string? BookingType = null,
    string? BookingStatus = null,
    int PageNumber = 1,
    int PageSize = 10) : IRequest<PagedList<BookingsListDto>>;
