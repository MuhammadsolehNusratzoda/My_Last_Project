using System;
using MediatR;

namespace TouristSystem.Application.Features.Bookings.Commands.ConfirmBooking;

/// <summary>
/// CQRS request record to confirm a pending booking reservation.
/// </summary>
public record ConfirmBookingCommand(Guid Id) : IRequest;
