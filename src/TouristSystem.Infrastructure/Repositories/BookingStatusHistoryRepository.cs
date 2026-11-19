using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Interfaces;
using TouristSystem.Infrastructure.Data;

namespace TouristSystem.Infrastructure.Repositories;

/// <summary>
/// Booking status history repository implementation using Entity Framework Core.
/// </summary>
public class BookingStatusHistoryRepository : GenericRepository<BookingStatusHistory>, IBookingStatusHistoryRepository
{
    public BookingStatusHistoryRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<BookingStatusHistory>> GetByBookingIdAsync(Guid bookingId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AsNoTracking()
            .Where(h => h.BookingId == bookingId)
            .OrderBy(h => h.ChangedAt)
            .ToListAsync(cancellationToken);
    }
}
