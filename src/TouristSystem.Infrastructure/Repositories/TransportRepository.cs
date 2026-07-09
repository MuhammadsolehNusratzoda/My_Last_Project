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
/// Transport-specific repository implementation using Entity Framework Core.
/// </summary>
public class TransportRepository : GenericRepository<Transport>, ITransportRepository
{
    public TransportRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<(IReadOnlyList<Transport> Items, int TotalCount)> GetPagedAsync(
        string? searchTerm,
        string? originCity,
        string? destinationCity,
        string? transportType,
        decimal? maxPricePerSeat,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var search = searchTerm.Trim().ToLower();
            query = query.Where(t => t.Name.ToLower().Contains(search) || t.VehicleNumber.ToLower().Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(originCity))
        {
            var city = originCity.Trim().ToLower();
            query = query.Where(t => t.OriginCity.ToLower() == city);
        }

        if (!string.IsNullOrWhiteSpace(destinationCity))
        {
            var city = destinationCity.Trim().ToLower();
            query = query.Where(t => t.DestinationCity.ToLower() == city);
        }

        if (!string.IsNullOrWhiteSpace(transportType) && System.Enum.TryParse<TouristSystem.Domain.Enums.TransportType>(transportType, true, out var type))
        {
            query = query.Where(t => t.Type == type);
        }

        if (maxPricePerSeat.HasValue)
        {
            query = query.Where(t => t.PricePerSeat <= maxPricePerSeat.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(t => t.DepartureTime)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}
