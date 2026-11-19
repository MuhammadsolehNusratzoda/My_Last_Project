using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Features.Bookings.Common;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Bookings.Commands.ProcessLifecycle;

/// <summary>Result of one lifecycle run (for logging).</summary>
public record BookingLifecycleResult(int Expired, int Completed);

/// <summary>
/// System job: Pending bookings older than <paramref name="PendingTimeout"/> become Expired (capacity released);
/// Confirmed bookings whose end date has passed become Completed.
/// </summary>
public record ProcessBookingLifecycleCommand(TimeSpan PendingTimeout) : IRequest<BookingLifecycleResult>;

public class ProcessBookingLifecycleCommandHandler : IRequestHandler<ProcessBookingLifecycleCommand, BookingLifecycleResult>
{
    private readonly IUnitOfWork _unitOfWork;

    public ProcessBookingLifecycleCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<BookingLifecycleResult> Handle(ProcessBookingLifecycleCommand request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;

        var stalePending = await _unitOfWork.Bookings.GetPendingCreatedBeforeAsync(now - request.PendingTimeout, cancellationToken);
        foreach (var booking in stalePending)
        {
            await BookingWorkflow.ReleaseCapacityAsync(_unitOfWork, booking, cancellationToken);
            await BookingWorkflow.ChangeStatusAsync(_unitOfWork, booking, BookingStatus.Expired, null,
                "Not confirmed by the partner in time", cancellationToken);
            await BookingWorkflow.NotifyTravelerAsync(_unitOfWork, booking,
                "Booking expired",
                $"Your booking for {booking.StartDate:yyyy-MM-dd} expired because it was not confirmed in time.",
                cancellationToken);
        }

        var finished = await _unitOfWork.Bookings.GetConfirmedEndedBeforeAsync(now, cancellationToken);
        foreach (var booking in finished)
        {
            await BookingWorkflow.ChangeStatusAsync(_unitOfWork, booking, BookingStatus.Completed, null,
                "Completed automatically after the end date", cancellationToken);
        }

        if (stalePending.Count > 0 || finished.Count > 0)
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return new BookingLifecycleResult(stalePending.Count, finished.Count);
    }
}
