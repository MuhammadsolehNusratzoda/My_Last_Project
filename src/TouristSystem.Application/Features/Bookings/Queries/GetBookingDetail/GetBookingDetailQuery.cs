using System;
using MediatR;

namespace TouristSystem.Application.Features.Bookings.Queries.GetBookingDetail;

/// <summary>
/// CQRS request record to fetch details of a booking by ID.
/// </summary>
public record GetBookingDetailQuery(Guid Id) : IRequest<BookingDetailDto?>;
