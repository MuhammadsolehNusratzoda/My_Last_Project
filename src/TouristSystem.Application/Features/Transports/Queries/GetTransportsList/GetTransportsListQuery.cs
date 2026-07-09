using MediatR;
using TouristSystem.Application.Common.Models;

namespace TouristSystem.Application.Features.Transports.Queries.GetTransportsList;

/// <summary>
/// CQRS request record to fetch a paginated list of Transport routes.
/// </summary>
public record GetTransportsListQuery(
    string? SearchTerm = null,
    string? OriginCity = null,
    string? DestinationCity = null,
    string? TransportType = null,
    decimal? MaxPricePerSeat = null,
    int PageNumber = 1,
    int PageSize = 10) : IRequest<PagedList<TransportsListDto>>;
