using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Common.Models;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Transports.Queries.GetTransportsList;

/// <summary>
/// Handles GetTransportsListQuery requests, returning mapped paged lists of Transports.
/// </summary>
public class GetTransportsListQueryHandler : IRequestHandler<GetTransportsListQuery, PagedList<TransportsListDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetTransportsListQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedList<TransportsListDto>> Handle(GetTransportsListQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _unitOfWork.Transports.GetPagedAsync(
            request.SearchTerm,
            request.OriginCity,
            request.DestinationCity,
            request.TransportType,
            request.MaxPricePerSeat,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        var dtos = items.Select(x => new TransportsListDto(
            x.Id,
            x.Name,
            x.Type.ToString(),
            x.OriginCity,
            x.DestinationCity,
            x.DepartureTime,
            x.ArrivalTime,
            x.PricePerSeat,
            x.TotalSeats,
            x.AvailableSeats,
            x.VehicleNumber
        )).ToList();

        return new PagedList<TransportsListDto>(dtos, totalCount, request.PageNumber, request.PageSize);
    }
}
