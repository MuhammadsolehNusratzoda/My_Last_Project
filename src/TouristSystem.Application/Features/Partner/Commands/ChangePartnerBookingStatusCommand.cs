using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Features.Bookings.Common;
using TouristSystem.Application.Interfaces;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Partner.Commands;

public enum PartnerBookingAction
{
    Confirm = 1,
    Reject = 2,
    Complete = 3,
    NoShow = 4
}

/// <summary>
/// A partner moves one of their bookings through the state machine:
/// Pending → Confirmed | Cancelled (reject);  Confirmed → Completed | Completed (no-show).
/// </summary>
public record ChangePartnerBookingStatusCommand(Guid BookingId, PartnerBookingAction Action, string? Reason) : IRequest;

public class ChangePartnerBookingStatusCommandHandler : IRequestHandler<ChangePartnerBookingStatusCommand>
{
    private const int MaxReasonLength = 500;

    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public ChangePartnerBookingStatusCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task Handle(ChangePartnerBookingStatusCommand request, CancellationToken cancellationToken)
    {
        var partner = await PartnerContext.GetCurrentPartnerAsync(_currentUserService, _unitOfWork, cancellationToken);

        // Ownership check is part of the query: someone else's booking is simply "not found" (404)
        var booking = await _unitOfWork.Bookings.GetForPartnerAsync(request.BookingId, partner.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"Booking with ID '{request.BookingId}' was not found.");

        var reason = request.Reason?.Trim();
        if (reason != null && reason.Length > MaxReasonLength)
        {
            throw new ArgumentException($"Reason must be at most {MaxReasonLength} characters.");
        }

        var now = DateTime.UtcNow;

        switch (request.Action)
        {
            case PartnerBookingAction.Confirm:
                RequireStatus(booking.Status, BookingStatus.Pending, "confirm");
                await BookingWorkflow.ChangeStatusAsync(_unitOfWork, booking, BookingStatus.Confirmed, partner.Id, reason, cancellationToken);
                await BookingWorkflow.NotifyTravelerAsync(_unitOfWork, booking,
                    "Booking confirmed",
                    $"Your booking for {booking.StartDate:yyyy-MM-dd} has been confirmed.",
                    cancellationToken);
                break;

            case PartnerBookingAction.Reject:
                RequireStatus(booking.Status, BookingStatus.Pending, "reject");
                if (string.IsNullOrWhiteSpace(reason))
                {
                    throw new ArgumentException("A reason is required to reject a booking.");
                }
                booking.RejectionReason = reason;
                await BookingWorkflow.ReleaseCapacityAsync(_unitOfWork, booking, cancellationToken);
                await BookingWorkflow.ChangeStatusAsync(_unitOfWork, booking, BookingStatus.Cancelled, partner.Id, reason, cancellationToken);
                await BookingWorkflow.NotifyTravelerAsync(_unitOfWork, booking,
                    "Booking declined",
                    $"Your booking for {booking.StartDate:yyyy-MM-dd} was declined. Reason: {reason}",
                    cancellationToken);
                break;

            case PartnerBookingAction.Complete:
                RequireStatus(booking.Status, BookingStatus.Confirmed, "complete");
                if (booking.EndDate > now)
                {
                    throw new InvalidOperationException("A booking can be completed only after its end date.");
                }
                await BookingWorkflow.ChangeStatusAsync(_unitOfWork, booking, BookingStatus.Completed, partner.Id, reason, cancellationToken);
                break;

            case PartnerBookingAction.NoShow:
                RequireStatus(booking.Status, BookingStatus.Confirmed, "mark as no-show");
                if (booking.StartDate > now)
                {
                    throw new InvalidOperationException("A no-show can be recorded only after the start date.");
                }
                booking.IsNoShow = true;
                await BookingWorkflow.ChangeStatusAsync(_unitOfWork, booking, BookingStatus.Completed, partner.Id,
                    string.IsNullOrWhiteSpace(reason) ? "No-show" : reason, cancellationToken);
                break;

            default:
                throw new ArgumentException("Unknown booking action.");
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static void RequireStatus(BookingStatus actual, BookingStatus expected, string action)
    {
        if (actual != expected)
        {
            throw new InvalidOperationException($"Cannot {action} a booking with status '{actual}'. Expected '{expected}'.");
        }
    }
}
