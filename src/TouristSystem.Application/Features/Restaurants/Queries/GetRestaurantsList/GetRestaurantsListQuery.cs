using MediatR;
using TouristSystem.Application.Common.Models;

namespace TouristSystem.Application.Features.Restaurants.Queries.GetRestaurantsList;

/// <summary>
/// CQRS request record to fetch a paginated list of Restaurants with filtering options.
/// </summary>
public record GetRestaurantsListQuery(
    string? SearchTerm = null,
    string? City = null,
    string? CuisineType = null,
    string? PriceRange = null,
    int PageNumber = 1,
    int PageSize = 10) : IRequest<PagedList<RestaurantsListDto>>;
