using MediatR;
using TouristSystem.Application.Common.Models;

namespace TouristSystem.Application.Features.Places.Queries.GetPlacesList;

/// <summary>
/// CQRS request record to fetch a paginated collection of tourist Places.
/// </summary>
public record GetPlacesListQuery(
    string? SearchTerm = null,
    string? City = null,
    int PageNumber = 1,
    int PageSize = 10) : IRequest<PagedList<PlacesListDto>>;
