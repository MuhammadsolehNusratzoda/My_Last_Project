using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Common.Models;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.TouristSearch.Queries.SearchPassengerProviders;

public class SearchPassengerProvidersQueryHandler : IRequestHandler<SearchPassengerProvidersQuery, PagedList<PassengerProviderSearchResultDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public SearchPassengerProvidersQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedList<PassengerProviderSearchResultDto>> Handle(SearchPassengerProvidersQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _unitOfWork.TransportProviders.SearchApprovedPagedAsync(
            request.CurrentCity,
            request.DestinationCity,
            request.CompanyName,
            request.ServiceType,
            request.MinRating,
            request.Language,
            request.HasAirConditioning,
            request.MinSeats,
            request.IsAvailableNow,
            request.IsVerifiedOnly,
            request.Page,
            request.PageSize,
            cancellationToken);

        var dtos = items.Select(p => new PassengerProviderSearchResultDto
        {
            Id = p.Id,
            UserId = p.UserId,
            FullName = p.FullName,
            Phone = p.Phone,
            CurrentCity = p.CurrentCity,
            ProfilePhotoUrl = p.ProfilePhotoUrl ?? string.Empty,
            CompanyName = p.Company != null ? p.Company.Name : (p.CustomCompanyName ?? "Independent"),
            YearsDrivingExperience = p.YearsDrivingExperience,
            RatingAverage = p.RatingAverage,
            CompletedTripsCount = p.CompletedTripsCount,
            DriverStatus = p.DriverStatus.ToString(),
            IsFullyVerified = p.IsIdentityVerified && p.IsLicenseVerified && p.IsVehicleVerified && p.IsInsuranceVerified && p.IsCompanyVerified,

            VehicleBrand = p.Vehicle?.Brand ?? string.Empty,
            VehicleModel = p.Vehicle?.Model ?? string.Empty,
            VehicleYear = p.Vehicle?.ManufacturingYear ?? 0,
            VehicleColor = p.Vehicle?.Color ?? string.Empty,
            PassengerSeats = p.Vehicle?.PassengerSeats ?? 4,
            VehicleRegNumber = p.Vehicle?.RegistrationNumber ?? string.Empty,
            VehiclePhotos = p.Vehicle?.Photos.OrderBy(ph => ph.DisplayOrder).Select(ph => ph.PhotoUrl).ToList() ?? new(),

            HasAirConditioning = p.Vehicle?.HasAirConditioning ?? false,
            HasWifi = p.Vehicle?.HasWifi ?? false,
            HasLuggageSpace = p.Vehicle?.HasLuggageSpace ?? false,
            ChildSeatAvailable = p.Vehicle?.ChildSeatAvailable ?? false,
            WheelchairAccessible = p.Vehicle?.WheelchairAccessible ?? false,

            ServiceTypes = p.Service != null ? JsonSerializer.Deserialize<List<string>>(p.Service.ServiceTypes) ?? new() : new(),
            AvailableCities = p.Service != null ? JsonSerializer.Deserialize<List<string>>(p.Service.AvailableCities) ?? new() : new(),
            LanguagesSpoken = p.Service != null ? JsonSerializer.Deserialize<List<string>>(p.Service.LanguagesSpoken) ?? new() : new(),
            PaymentMethods = p.Service != null ? JsonSerializer.Deserialize<List<string>>(p.Service.PaymentMethods) ?? new() : new()
        }).ToList();

        return new PagedList<PassengerProviderSearchResultDto>(dtos, totalCount, request.Page, request.PageSize);
    }
}
