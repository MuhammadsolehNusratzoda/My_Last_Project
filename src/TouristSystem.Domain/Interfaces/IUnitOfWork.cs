using System;
using System.Threading;
using System.Threading.Tasks;

namespace TouristSystem.Domain.Interfaces;

/// <summary>
/// Dictates transaction unit contracts, coordinating atomic commits across repositories.
/// </summary>
public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IRefreshTokenRepository RefreshTokens { get; }
    IPlaceRepository Places { get; }
    IHotelRepository Hotels { get; }
    IRestaurantRepository Restaurants { get; }
    ITransportRepository Transports { get; }
    ITransportProviderRepository TransportProviders { get; }
    ITransportCompanyRepository TransportCompanies { get; }
    IGuideRepository Guides { get; }
    IBookingRepository Bookings { get; }
    IReviewRepository Reviews { get; }
    IFavoriteRepository Favorites { get; }
    INotificationRepository Notifications { get; }
    IAuditLogRepository AuditLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
