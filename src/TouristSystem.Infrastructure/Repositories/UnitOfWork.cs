using System;
using System.Threading;
using System.Threading.Tasks;
using TouristSystem.Domain.Interfaces;
using TouristSystem.Infrastructure.Data;

namespace TouristSystem.Infrastructure.Repositories;

/// <summary>
/// Unit of Work implementation managing database transactions and repository lifetimes.
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private bool _disposed;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
        Users = new UserRepository(context);
        RefreshTokens = new RefreshTokenRepository(context);
        Places = new PlaceRepository(context);
        Hotels = new HotelRepository(context);
        Restaurants = new RestaurantRepository(context);
        Transports = new TransportRepository(context);
        Guides = new GuideRepository(context);
        Bookings = new BookingRepository(context);
        Reviews = new ReviewRepository(context);
        Favorites = new FavoriteRepository(context);
        Notifications = new NotificationRepository(context);
        AuditLogs = new AuditLogRepository(context);
    }

    public IUserRepository Users { get; }
    public IRefreshTokenRepository RefreshTokens { get; }
    public IPlaceRepository Places { get; }
    public IHotelRepository Hotels { get; }
    public IRestaurantRepository Restaurants { get; }
    public ITransportRepository Transports { get; }
    public IGuideRepository Guides { get; }
    public IBookingRepository Bookings { get; }
    public IReviewRepository Reviews { get; }
    public IFavoriteRepository Favorites { get; }
    public INotificationRepository Notifications { get; }
    public IAuditLogRepository AuditLogs { get; }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed)
        {
            if (disposing)
            {
                _context.Dispose();
            }
            _disposed = true;
        }
    }
}
