using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Interfaces;
using TouristSystem.Infrastructure.Data;

namespace TouristSystem.Infrastructure.Repositories;

public class TransportProviderRepository : GenericRepository<TransportProviderProfile>, ITransportProviderRepository
{
    public TransportProviderRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<TransportProviderProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.Company)
            .Include(p => p.Vehicle!)
                .ThenInclude(v => v.Photos)
            .Include(p => p.Service)
            .Include(p => p.WorkingHours)
            .Include(p => p.Documents)
            .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
    }

    public async Task<TransportProviderProfile?> GetDetailByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(p => p.User)
            .Include(p => p.Company)
            .Include(p => p.Vehicle!)
                .ThenInclude(v => v.Photos)
            .Include(p => p.Service)
            .Include(p => p.WorkingHours)
            .Include(p => p.Documents)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<bool> PhoneExistsAsync(string phone, Guid? excludeUserId = null, CancellationToken cancellationToken = default)
    {
        var cleanPhone = phone.Trim().ToLower();
        return await DbSet.AnyAsync(p => p.Phone.ToLower() == cleanPhone && (excludeUserId == null || p.UserId != excludeUserId), cancellationToken);
    }

    public async Task<bool> LicenseNumberExistsAsync(string licenseNumber, Guid? excludeUserId = null, CancellationToken cancellationToken = default)
    {
        var cleanLicense = licenseNumber.Trim().ToLower();
        return await DbSet.AnyAsync(p => p.LicenseNumber.ToLower() == cleanLicense && (excludeUserId == null || p.UserId != excludeUserId), cancellationToken);
    }

    public async Task<bool> VehicleRegExistsAsync(string regNumber, Guid? excludeVehicleId = null, CancellationToken cancellationToken = default)
    {
        var cleanReg = regNumber.Trim().ToLower();
        return await Context.Set<ProviderVehicle>().AnyAsync(v => v.RegistrationNumber.ToLower() == cleanReg && (excludeVehicleId == null || v.Id != excludeVehicleId), cancellationToken);
    }

    public async Task<(IReadOnlyList<TransportProviderProfile> Items, int TotalCount)> GetAdminPagedAsync(string? status, string? company, string? city, string? search, bool? isVerifiedOnly, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = DbSet
            .Include(p => p.Company)
            .Include(p => p.Vehicle)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<Domain.Enums.ApplicationStatus>(status, true, out var appStatus))
        {
            query = query.Where(p => p.ApplicationStatus == appStatus);
        }

        if (!string.IsNullOrWhiteSpace(company))
        {
            var comp = company.Trim().ToLower();
            query = query.Where(p => (p.Company != null && p.Company.Name.ToLower().Contains(comp)) ||
                                     (p.CustomCompanyName != null && p.CustomCompanyName.ToLower().Contains(comp)));
        }

        if (!string.IsNullOrWhiteSpace(city))
        {
            var c = city.Trim().ToLower();
            query = query.Where(p => p.CurrentCity.ToLower().Contains(c));
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(p => p.FullName.ToLower().Contains(s) ||
                                     p.Phone.ToLower().Contains(s) ||
                                     (p.Vehicle != null && p.Vehicle.RegistrationNumber.ToLower().Contains(s)) ||
                                     (p.Company != null && p.Company.Name.ToLower().Contains(s)) ||
                                     (p.CustomCompanyName != null && p.CustomCompanyName.ToLower().Contains(s)));
        }

        if (isVerifiedOnly.HasValue && isVerifiedOnly.Value)
        {
            query = query.Where(p => p.IsIdentityVerified && p.IsLicenseVerified && p.IsVehicleVerified && p.IsInsuranceVerified && p.IsCompanyVerified);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<(IReadOnlyList<TransportProviderProfile> Items, int TotalCount)> SearchApprovedPagedAsync(string? currentCity, string? destinationCity, string? companyName, string? serviceType, decimal? minRating, string? language, bool? hasAc, int? minSeats, bool? isAvailableNow, bool? isVerifiedOnly, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = DbSet
            .Include(p => p.Company)
            .Include(p => p.Vehicle!)
                .ThenInclude(v => v.Photos)
            .Include(p => p.Service)
            .Where(p => p.ApplicationStatus == Domain.Enums.ApplicationStatus.Approved)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(currentCity))
        {
            var city = currentCity.Trim().ToLower();
            query = query.Where(p => p.CurrentCity.ToLower().Contains(city) ||
                                     (p.Service != null && p.Service.AvailableCities.ToLower().Contains(city)));
        }

        if (!string.IsNullOrWhiteSpace(destinationCity))
        {
            var dest = destinationCity.Trim().ToLower();
            query = query.Where(p => p.Service != null && p.Service.AvailableCities.ToLower().Contains(dest));
        }

        if (!string.IsNullOrWhiteSpace(companyName))
        {
            var comp = companyName.Trim().ToLower();
            query = query.Where(p => (p.Company != null && p.Company.Name.ToLower().Contains(comp)) ||
                                     (p.CustomCompanyName != null && p.CustomCompanyName.ToLower().Contains(comp)));
        }

        if (!string.IsNullOrWhiteSpace(serviceType))
        {
            var st = serviceType.Trim().ToLower();
            query = query.Where(p => p.Service != null && p.Service.ServiceTypes.ToLower().Contains(st));
        }

        if (minRating.HasValue)
        {
            query = query.Where(p => p.RatingAverage >= minRating.Value);
        }

        if (!string.IsNullOrWhiteSpace(language))
        {
            var lang = language.Trim().ToLower();
            query = query.Where(p => p.Service != null && p.Service.LanguagesSpoken.ToLower().Contains(lang));
        }

        if (hasAc.HasValue && hasAc.Value)
        {
            query = query.Where(p => p.Vehicle != null && p.Vehicle.HasAirConditioning);
        }

        if (minSeats.HasValue)
        {
            query = query.Where(p => p.Vehicle != null && p.Vehicle.PassengerSeats >= minSeats.Value);
        }

        if (isAvailableNow.HasValue && isAvailableNow.Value)
        {
            query = query.Where(p => p.DriverStatus == Domain.Enums.DriverStatus.Available);
        }

        if (isVerifiedOnly.HasValue && isVerifiedOnly.Value)
        {
            query = query.Where(p => p.IsIdentityVerified && p.IsLicenseVerified && p.IsVehicleVerified && p.IsInsuranceVerified && p.IsCompanyVerified);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(p => p.RatingAverage)
            .ThenByDescending(p => p.CompletedTripsCount)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}
