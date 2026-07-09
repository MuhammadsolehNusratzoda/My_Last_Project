using MediatR;

namespace TouristSystem.Application.Features.Hotels.Queries.GetHotelDetail;

/// <summary>
/// CQRS request record to fetch details of a Hotel by ID or slug.
/// </summary>
public record GetHotelDetailQuery(string IdOrSlug) : IRequest<HotelDetailDto?>;
