using System;

namespace TouristSystem.Application.Features.Bookings.Queries.GetBookingDetail;

/// <summary>
/// Data Transfer Object representing the comprehensive details of a booking reservation.
/// </summary>
public record BookingDetailDto(
    Guid Id,
    Guid UserId,
    string UserName,
    string UserEmail,
    string BookingType,
    Guid ReferenceId,
    string ReferenceName,
    DateTime StartDate,
    DateTime EndDate,
    int GuestsCount,
    int Quantity,
    decimal TotalPrice,
    string Status,
    string? Notes,
    DateTime? ConfirmedAt,
    DateTime? CancelledAt,
    DateTime CreatedAt);
