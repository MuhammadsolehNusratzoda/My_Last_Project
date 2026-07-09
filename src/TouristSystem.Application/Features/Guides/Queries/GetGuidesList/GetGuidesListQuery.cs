using MediatR;
using TouristSystem.Application.Common.Models;

namespace TouristSystem.Application.Features.Guides.Queries.GetGuidesList;

/// <summary>
/// CQRS request record to fetch a paginated list of Guides with filtering options.
/// </summary>
public record GetGuidesListQuery(
    string? SearchTerm = null,
    string? City = null,
    string? Language = null,
    decimal? MaxPricePerDay = null,
    int PageNumber = 1,
    int PageSize = 10) : IRequest<PagedList<GuidesListDto>>;
