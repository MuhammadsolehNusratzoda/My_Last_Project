using System;
using System.Threading;
using System.Threading.Tasks;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Bookings.Common;

/// <summary>
/// Shared booking state-machine helpers used by traveler, partner and background flows,
/// so every status change records history and releases capacity the same way.
/// </summary>
public static class BookingWorkflow
{
    /// <summary>Returns the owner (partner) of the listing a booking points to, or null if the listing does not exist.</summary>
    public static async Task<Guid?> ResolvePartnerIdAsync(
        IUnitOfWork unitOfWork, BookingType type, Guid referenceId, CancellationToken cancellationToken)
    {
        switch (type)
        {
            case BookingType.Hotel:
                return (await unitOfWork.Hotels.GetByIdAsync(referenceId, cancellationToken))?.OwnerId;
            case BookingType.Transport:
                return (await unitOfWork.Transports.GetByIdAsync(referenceId, cancellationToken))?.OwnerId;
            case BookingType.Guide:
                return (await unitOfWork.Guides.GetByIdAsync(referenceId, cancellationToken))?.UserId;
            case BookingType.Restaurant:
                return (await unitOfWork.Restaurants.GetByIdAsync(referenceId, cancellationToken))?.OwnerId;
            default:
                return null;
        }
    }

    /// <summary>Gives back the rooms / seats a booking was holding (used on reject, cancel and expiry).</summary>
    public static async Task ReleaseCapacityAsync(IUnitOfWork unitOfWork, Booking booking, CancellationToken cancellationToken)
    {
        if (booking.BookingType == BookingType.Hotel)
        {
            var hotel = await unitOfWork.Hotels.GetByIdAsync(booking.ReferenceId, cancellationToken);
            if (hotel != null)
            {
                hotel.AvailableRooms = Math.Min(hotel.TotalRooms, hotel.AvailableRooms + booking.Quantity);
                unitOfWork.Hotels.Update(hotel);
            }
        }
        else if (booking.BookingType == BookingType.Transport)
        {
            var transport = await unitOfWork.Transports.GetByIdAsync(booking.ReferenceId, cancellationToken);
            if (transport != null)
            {
                transport.AvailableSeats = Math.Min(transport.TotalSeats, transport.AvailableSeats + booking.Quantity);
                unitOfWork.Transports.Update(transport);
            }
        }
    }

    /// <summary>Changes the status and writes a BookingStatusHistory row (changedByUserId = null means "system").</summary>
    public static async Task ChangeStatusAsync(
        IUnitOfWork unitOfWork,
        Booking booking,
        BookingStatus newStatus,
        Guid? changedByUserId,
        string? reason,
        CancellationToken cancellationToken)
    {
        var oldStatus = booking.Status;
        var now = DateTime.UtcNow;

        booking.Status = newStatus;
        switch (newStatus)
        {
            case BookingStatus.Confirmed:
                booking.ConfirmedAt = now;
                break;
            case BookingStatus.Cancelled:
                booking.CancelledAt = now;
                break;
            case BookingStatus.Completed:
                booking.CompletedAt = now;
                break;
        }

        unitOfWork.Bookings.Update(booking);

        await unitOfWork.BookingStatusHistories.AddAsync(new BookingStatusHistory
        {
            BookingId = booking.Id,
            FromStatus = oldStatus,
            ToStatus = newStatus,
            ChangedByUserId = changedByUserId,
            Reason = reason,
            ChangedAt = now
        }, cancellationToken);
    }

    /// <summary>Adds an in-app notification for the traveler who made the booking.</summary>
    public static Task NotifyTravelerAsync(
        IUnitOfWork unitOfWork, Booking booking, string title, string message, CancellationToken cancellationToken)
    {
        return unitOfWork.Notifications.AddAsync(new Notification
        {
            UserId = booking.UserId,
            Title = title,
            Message = message,
            Type = NotificationType.Booking,
            CreatedAt = DateTime.UtcNow
        }, cancellationToken);
    }
}
