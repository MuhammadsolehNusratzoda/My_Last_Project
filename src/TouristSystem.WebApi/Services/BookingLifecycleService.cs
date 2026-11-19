using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using TouristSystem.Application.Features.Bookings.Commands.ProcessLifecycle;

namespace TouristSystem.WebApi.Services;

/// <summary>
/// Every 15 minutes: expires Pending bookings that were not confirmed within 24 hours
/// and completes Confirmed bookings whose end date has passed.
/// </summary>
public class BookingLifecycleService : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(15);
    private static readonly TimeSpan PendingTimeout = TimeSpan.FromHours(24);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<BookingLifecycleService> _logger;

    public BookingLifecycleService(IServiceScopeFactory scopeFactory, ILogger<BookingLifecycleService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Small delay so startup (seeding, migrations check) finishes first
        await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

        using var timer = new PeriodicTimer(Interval);
        do
        {
            try
            {
                // DbContext and repositories are Scoped, so each run gets its own scope
                using var scope = _scopeFactory.CreateScope();
                var sender = scope.ServiceProvider.GetRequiredService<ISender>();
                var result = await sender.Send(new ProcessBookingLifecycleCommand(PendingTimeout), stoppingToken);

                if (result.Expired > 0 || result.Completed > 0)
                {
                    _logger.LogInformation("Booking lifecycle: {Expired} expired, {Completed} completed.", result.Expired, result.Completed);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                // Never let one failed run stop the service
                _logger.LogError(ex, "Booking lifecycle run failed.");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}
