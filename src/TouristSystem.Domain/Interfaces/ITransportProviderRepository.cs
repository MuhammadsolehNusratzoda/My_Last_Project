using System;
using System.Threading;
using System.Threading.Tasks;
using TouristSystem.Domain.Entities;

namespace TouristSystem.Domain.Interfaces;

/// <summary>
/// Specific repository contracts for Passenger Transport Provider queries.
/// </summary>
public interface ITransportProviderRepository : IGenericRepository<TransportProviderProfile>
{
    Task<TransportProviderProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<TransportProviderProfile?> GetDetailByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> PhoneExistsAsync(string phone, Guid? excludeUserId = null, CancellationToken cancellationToken = default);
    Task<bool> LicenseNumberExistsAsync(string licenseNumber, Guid? excludeUserId = null, CancellationToken cancellationToken = default);
    Task<bool> VehicleRegExistsAsync(string regNumber, Guid? excludeVehicleId = null, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<TransportProviderProfile> Items, int TotalCount)> GetAdminPagedAsync(string? status, string? company, string? city, string? search, bool? isVerifiedOnly, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<TransportProviderProfile> Items, int TotalCount)> SearchApprovedPagedAsync(string? currentCity, string? destinationCity, string? companyName, string? serviceType, decimal? minRating, string? language, bool? hasAc, int? minSeats, bool? isAvailableNow, bool? isVerifiedOnly, int page, int pageSize, CancellationToken cancellationToken = default);
}
