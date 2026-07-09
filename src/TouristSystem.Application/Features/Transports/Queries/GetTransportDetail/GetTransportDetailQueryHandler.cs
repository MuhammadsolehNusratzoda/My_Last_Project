using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Transports.Queries.GetTransportDetail;

/// <summary>
/// Handles GetTransportDetailQuery requests, resolving targets by ID and mapping them.
/// </summary>
public class GetTransportDetailQueryHandler : IRequestHandler<GetTransportDetailQuery, TransportDetailDto?>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetTransportDetailQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<TransportDetailDto?> Handle(GetTransportDetailQuery request, CancellationToken cancellationToken)
    {
        var transport = await _unitOfWork.Transports.GetByIdAsync(request.Id, cancellationToken);

        if (transport == null)
        {
            return null;
        }

        return new TransportDetailDto(
            transport.Id,
            transport.OwnerId,
            transport.Name,
            transport.Type.ToString(),
            transport.OriginCity,
            transport.DestinationCity,
            transport.DepartureTime,
            transport.ArrivalTime,
            transport.PricePerSeat,
            transport.TotalSeats,
            transport.AvailableSeats,
            transport.VehicleNumber,
            transport.ContactPhone,
            transport.Status.ToString(),
            transport.CreatedAt);
    }
}
