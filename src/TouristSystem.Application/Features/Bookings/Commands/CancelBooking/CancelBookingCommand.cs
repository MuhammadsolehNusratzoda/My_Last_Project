using System;
using MediatR;

namespace TouristSystem.Application.Features.Bookings.Commands.CancelBooking;

/// <summary>
/// CQRS request record to cancel a booking reservation and restore capacities.
/// </summary>
public record CancelBookingCommand(Guid Id) : IRequest;
