using System;
using MediatR;

namespace TouristSystem.Application.Features.Transports.Commands.CreateTransport;

/// <summary>
/// CQRS request record to create a new Transport route.
/// </summary>
public record CreateTransportCommand(
    Guid OwnerId,
    string Name,
    string Type,
    string OriginCity,
    string DestinationCity,
    DateTime DepartureTime,
    DateTime ArrivalTime,
    decimal PricePerSeat,
    int TotalSeats,
    string VehicleNumber,
    string ContactPhone) : IRequest<Guid>;
