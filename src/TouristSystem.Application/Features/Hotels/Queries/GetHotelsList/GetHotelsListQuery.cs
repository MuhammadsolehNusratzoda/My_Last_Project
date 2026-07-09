using MediatR;
using TouristSystem.Application.Common.Models;

namespace TouristSystem.Application.Features.Hotels.Queries.GetHotelsList;

/// <summary>
/// CQRS request record to fetch a paginated list of Hotels with filtering options.
/// </summary>
public record GetHotelsListQuery(
    string? SearchTerm = null,
    string? City = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    int? Stars = null,
    int PageNumber = 1,
    int PageSize = 10) : IRequest<PagedList<HotelsListDto>>;
