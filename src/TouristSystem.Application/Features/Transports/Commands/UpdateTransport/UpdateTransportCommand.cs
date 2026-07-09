using System;
using MediatR;

namespace TouristSystem.Application.Features.Transports.Commands.UpdateTransport;

/// <summary>
/// CQRS request record to update an existing Transport route.
/// </summary>
public record UpdateTransportCommand(
    Guid Id,
    Guid OwnerId,
    string Name,
    string Type,
    string OriginCity,
    string DestinationCity,
    DateTime DepartureTime,
    DateTime ArrivalTime,
    decimal PricePerSeat,
    int TotalSeats,
    int AvailableSeats,
    string VehicleNumber,
    string ContactPhone,
    string Status) : IRequest;
