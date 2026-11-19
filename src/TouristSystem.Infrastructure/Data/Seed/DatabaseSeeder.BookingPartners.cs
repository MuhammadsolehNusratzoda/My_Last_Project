using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using TouristSystem.Domain.Enums;

namespace TouristSystem.Infrastructure.Data.Seed;

public static partial class DatabaseSeeder
{
    /// <summary>
    /// Fills Booking.PartnerId for bookings created before the Partner Portal existed
    /// (PartnerId = Guid.Empty). Safe to run on every startup: it only touches empty rows.
    /// </summary>
    public static void BackfillBookingPartners(ApplicationDbContext context)
    {
        var bookings = context.Bookings
            .IgnoreQueryFilters()
            .Where(b => b.PartnerId == Guid.Empty)
            .ToList();

        if (bookings.Count == 0)
        {
            return;
        }

        foreach (var booking in bookings)
        {
            Guid? partnerId = booking.BookingType switch
            {
                BookingType.Hotel => context.Hotels.IgnoreQueryFilters()
                    .Where(h => h.Id == booking.ReferenceId).Select(h => (Guid?)h.OwnerId).FirstOrDefault(),
                BookingType.Transport => context.Transports.IgnoreQueryFilters()
                    .Where(t => t.Id == booking.ReferenceId).Select(t => (Guid?)t.OwnerId).FirstOrDefault(),
                BookingType.Guide => context.Guides.IgnoreQueryFilters()
                    .Where(g => g.Id == booking.ReferenceId).Select(g => (Guid?)g.UserId).FirstOrDefault(),
                BookingType.Restaurant => context.Restaurants.IgnoreQueryFilters()
                    .Where(r => r.Id == booking.ReferenceId).Select(r => (Guid?)r.OwnerId).FirstOrDefault(),
                _ => null
            };

            if (partnerId.HasValue)
            {
                booking.PartnerId = partnerId.Value;
            }
        }

        context.SaveChanges();
    }
}
