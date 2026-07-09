using System;
using MediatR;

namespace TouristSystem.Application.Features.Bookings.Commands.CreateBooking;

/// <summary>
/// CQRS request record to create a new reservation transaction.
/// </summary>
public record CreateBookingCommand(
    Guid UserId,
    string BookingType,
    Guid ReferenceId,
    DateTime StartDate,
    DateTime EndDate,
    int GuestsCount,
    int Quantity,
    string? Notes) : IRequest<Guid>;
