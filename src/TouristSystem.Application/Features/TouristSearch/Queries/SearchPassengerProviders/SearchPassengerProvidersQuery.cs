using System;
using System.Collections.Generic;
using MediatR;
using TouristSystem.Application.Common.Models;

namespace TouristSystem.Application.Features.TouristSearch.Queries.SearchPassengerProviders;

public class PassengerProviderSearchResultDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string CurrentCity { get; set; } = string.Empty;
    public string ProfilePhotoUrl { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public int YearsDrivingExperience { get; set; }
    public decimal RatingAverage { get; set; }
    public int CompletedTripsCount { get; set; }

    public string DriverStatus { get; set; } = string.Empty;
    public bool IsFullyVerified { get; set; }

    // Vehicle details
    public string VehicleBrand { get; set; } = string.Empty;
    public string VehicleModel { get; set; } = string.Empty;
    public int VehicleYear { get; set; }
    public string VehicleColor { get; set; } = string.Empty;
    public int PassengerSeats { get; set; }
    public string VehicleRegNumber { get; set; } = string.Empty;
    public List<string> VehiclePhotos { get; set; } = new();

    // Features
    public bool HasAirConditioning { get; set; }
    public bool HasWifi { get; set; }
    public bool HasLuggageSpace { get; set; }
    public bool ChildSeatAvailable { get; set; }
    public bool WheelchairAccessible { get; set; }

    // Services
    public List<string> ServiceTypes { get; set; } = new();
    public List<string> AvailableCities { get; set; } = new();
    public List<string> LanguagesSpoken { get; set; } = new();
    public List<string> PaymentMethods { get; set; } = new();
}

public class SearchPassengerProvidersQuery : IRequest<PagedList<PassengerProviderSearchResultDto>>
{
    public string? CurrentCity { get; set; }
    public string? DestinationCity { get; set; }
    public string? CompanyName { get; set; }
    public string? ServiceType { get; set; }
    public decimal? MinRating { get; set; }
    public string? Language { get; set; }
    public bool? HasAirConditioning { get; set; }
    public int? MinSeats { get; set; }
    public bool? IsAvailableNow { get; set; }
    public bool? IsVerifiedOnly { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
