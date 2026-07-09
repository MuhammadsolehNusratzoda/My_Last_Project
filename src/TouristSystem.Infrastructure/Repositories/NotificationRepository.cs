using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Interfaces;
using TouristSystem.Infrastructure.Data;

namespace TouristSystem.Infrastructure.Repositories;

/// <summary>
/// Notification-specific repository implementation using Entity Framework Core.
/// </summary>
public class NotificationRepository : GenericRepository<Notification>, INotificationRepository
{
    public NotificationRepository(ApplicationDbContext context) : base(context)
    {
    }
}
