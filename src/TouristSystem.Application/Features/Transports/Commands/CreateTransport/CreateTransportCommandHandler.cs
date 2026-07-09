using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Transports.Commands.CreateTransport;

/// <summary>
/// Handles CreateTransportCommand requests, creating a transport route.
/// </summary>
public class CreateTransportCommandHandler : IRequestHandler<CreateTransportCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateTransportCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateTransportCommand request, CancellationToken cancellationToken)
    {
        var owner = await _unitOfWork.Users.GetByIdAsync(request.OwnerId, cancellationToken);
        if (owner == null)
        {
            throw new KeyNotFoundException($"Owner User with ID '{request.OwnerId}' was not found.");
        }

        if (!Enum.TryParse<TransportType>(request.Type, true, out var type))
        {
            type = TransportType.Bus;
        }

        var transport = new Transport
        {
            OwnerId = request.OwnerId,
            Name = request.Name,
            Type = type,
            OriginCity = request.OriginCity,
            DestinationCity = request.DestinationCity,
            DepartureTime = request.DepartureTime,
            ArrivalTime = request.ArrivalTime,
            PricePerSeat = request.PricePerSeat,
            TotalSeats = request.TotalSeats,
            AvailableSeats = request.TotalSeats,
            VehicleNumber = request.VehicleNumber,
            ContactPhone = request.ContactPhone,
            Status = EntityStatus.Approved
        };

        await _unitOfWork.Transports.AddAsync(transport, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return transport.Id;
    }
}
