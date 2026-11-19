using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;
using TouristSystem.Infrastructure.Data;

namespace TouristSystem.Infrastructure.Repositories;

/// <summary>
/// Booking-specific repository implementation using Entity Framework Core.
/// </summary>
public class BookingRepository : GenericRepository<Booking>, IBookingRepository
{
    public BookingRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<(IReadOnlyList<Booking> Items, int TotalCount)> GetPagedAsync(
        Guid? userId,
        string? bookingType,
        string? bookingStatus,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default,
        IReadOnlyCollection<Guid>? referenceIds = null)
    {
        var query = DbSet.Include(b => b.User).AsQueryable();

        if (userId.HasValue)
        {
            query = query.Where(b => b.UserId == userId.Value);
        }

        // Partner scope: only bookings that reference the partner's own listings
        if (referenceIds != null)
        {
            query = query.Where(b => referenceIds.Contains(b.ReferenceId));
        }

        if (!string.IsNullOrWhiteSpace(bookingType) && Enum.TryParse<TouristSystem.Domain.Enums.BookingType>(bookingType, true, out var type))
        {
            query = query.Where(b => b.BookingType == type);
        }

        if (!string.IsNullOrWhiteSpace(bookingStatus) && Enum.TryParse<TouristSystem.Domain.Enums.BookingStatus>(bookingStatus, true, out var status))
        {
            query = query.Where(b => b.Status == status);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<Booking?> GetWithUserByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
    }

    // ---------- Partner Portal ----------

    public async Task<(IReadOnlyList<Booking> Items, int TotalCount)> GetPartnerPagedAsync(
        Guid partnerId,
        BookingStatus? status,
        DateTime? fromUtc,
        DateTime? toUtc,
        string? search,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet
            .AsNoTracking()
            .Include(b => b.User)
            .Where(b => b.PartnerId == partnerId);

        if (status.HasValue)
        {
            query = query.Where(b => b.Status == status.Value);
        }

        // Date filter: bookings whose stay/trip overlaps [from, to)
        if (fromUtc.HasValue)
        {
            query = query.Where(b => b.EndDate >= fromUtc.Value);
        }

        if (toUtc.HasValue)
        {
            query = query.Where(b => b.StartDate < toUtc.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%";
            query = query.Where(b =>
                EF.Functions.ILike(b.User.FullName, pattern) ||
                EF.Functions.ILike(b.User.Email, pattern));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<Booking?> GetForPartnerAsync(Guid bookingId, Guid partnerId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == bookingId && b.PartnerId == partnerId, cancellationToken);
    }

    public async Task<int> CountForPartnerAsync(Guid partnerId, BookingStatus status, CancellationToken cancellationToken = default)
    {
        return await DbSet.CountAsync(b => b.PartnerId == partnerId && b.Status == status, cancellationToken);
    }

    public async Task<IReadOnlyList<Booking>> GetPartnerArrivalsAsync(Guid partnerId, DateTime fromUtc, DateTime toUtc, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AsNoTracking()
            .Include(b => b.User)
            .Where(b => b.PartnerId == partnerId
                        && b.Status == BookingStatus.Confirmed
                        && b.StartDate >= fromUtc
                        && b.StartDate < toUtc)
            .OrderBy(b => b.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> CountPartnerChangedToAsync(Guid partnerId, BookingStatus status, DateTime sinceUtc, CancellationToken cancellationToken = default)
    {
        return status switch
        {
            BookingStatus.Completed => await DbSet.CountAsync(b => b.PartnerId == partnerId && b.Status == status && b.CompletedAt >= sinceUtc, cancellationToken),
            BookingStatus.Cancelled => await DbSet.CountAsync(b => b.PartnerId == partnerId && b.Status == status && b.CancelledAt >= sinceUtc, cancellationToken),
            BookingStatus.Confirmed => await DbSet.CountAsync(b => b.PartnerId == partnerId && b.Status == status && b.ConfirmedAt >= sinceUtc, cancellationToken),
            _ => await DbSet.CountAsync(b => b.PartnerId == partnerId && b.Status == status && b.CreatedAt >= sinceUtc, cancellationToken)
        };
    }

    // ---------- Lifecycle (background service) ----------

    public async Task<IReadOnlyList<Booking>> GetPendingCreatedBeforeAsync(DateTime cutoffUtc, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(b => b.Status == BookingStatus.Pending && b.CreatedAt < cutoffUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Booking>> GetConfirmedEndedBeforeAsync(DateTime nowUtc, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(b => b.Status == BookingStatus.Confirmed && b.EndDate < nowUtc)
            .ToListAsync(cancellationToken);
    }
}
