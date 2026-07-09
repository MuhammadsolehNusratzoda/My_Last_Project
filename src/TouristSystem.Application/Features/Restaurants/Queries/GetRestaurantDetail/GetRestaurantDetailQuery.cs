using MediatR;

namespace TouristSystem.Application.Features.Restaurants.Queries.GetRestaurantDetail;

/// <summary>
/// CQRS request record to fetch details of a Restaurant by ID or slug.
/// </summary>
public record GetRestaurantDetailQuery(string IdOrSlug) : IRequest<RestaurantDetailDto?>;
