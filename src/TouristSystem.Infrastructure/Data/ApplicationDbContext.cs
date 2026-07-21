using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TouristSystem.Application.Interfaces;
using TouristSystem.Domain.Common;
using TouristSystem.Domain.Entities;

namespace TouristSystem.Infrastructure.Data;

/// <summary>
/// Primary Entity Framework Core database context, managing table operations and transactional audit tracking.
/// </summary>
public class ApplicationDbContext : DbContext
{
    private readonly ICurrentUserService _currentUserService;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        ICurrentUserService currentUserService)
        : base(options)
    {
        _currentUserService = currentUserService;
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Place> Places => Set<Place>();
    public DbSet<Hotel> Hotels => Set<Hotel>();
    public DbSet<Restaurant> Restaurants => Set<Restaurant>();
    public DbSet<Transport> Transports => Set<Transport>();
    public DbSet<TransportCompany> TransportCompanies => Set<TransportCompany>();
    public DbSet<TransportProviderProfile> TransportProviderProfiles => Set<TransportProviderProfile>();
    public DbSet<ProviderVehicle> ProviderVehicles => Set<ProviderVehicle>();
    public DbSet<VehiclePhoto> VehiclePhotos => Set<VehiclePhoto>();
    public DbSet<ProviderService> ProviderServices => Set<ProviderService>();
    public DbSet<ProviderWorkingHour> ProviderWorkingHours => Set<ProviderWorkingHour>();
    public DbSet<ProviderDocument> ProviderDocuments => Set<ProviderDocument>();
    public DbSet<Guide> Guides => Set<Guide>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var currentUserId = _currentUserService.UserId;
        var utcNow = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = utcNow;
                    entry.Entity.CreatedByUserId = currentUserId;
                    entry.Entity.IsDeleted = false;
                    break;

                case EntityState.Modified:
                    entry.Entity.UpdatedAt = utcNow;
                    entry.Entity.UpdatedByUserId = currentUserId;
                    break;

                case EntityState.Deleted:
                    entry.State = EntityState.Modified;
                    entry.Entity.IsDeleted = true;
                    entry.Entity.DeletedAt = utcNow;
                    entry.Entity.DeletedByUserId = currentUserId;
                    break;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
