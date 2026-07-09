using MediatR;

namespace TouristSystem.Application.Features.Places.Queries.GetPlaceDetail;

/// <summary>
/// CQRS request record to fetch details of a tourist Place by ID or slug.
/// </summary>
public record GetPlaceDetailQuery(string IdOrSlug) : IRequest<PlaceDetailDto?>;
