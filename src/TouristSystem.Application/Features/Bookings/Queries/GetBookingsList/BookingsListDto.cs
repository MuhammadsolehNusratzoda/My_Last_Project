using System;

namespace TouristSystem.Application.Features.Bookings.Queries.GetBookingsList;

/// <summary>
/// Data Transfer Object representing a summary of a reservation for list views.
/// </summary>
public record BookingsListDto(
    Guid Id,
    Guid UserId,
    string UserName,
    string BookingType,
    Guid ReferenceId,
    DateTime StartDate,
    DateTime EndDate,
    int GuestsCount,
    int Quantity,
    decimal TotalPrice,
    string Status,
    DateTime CreatedAt);
