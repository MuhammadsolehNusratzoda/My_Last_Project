using System;

namespace TouristSystem.Application.Features.Transports.Queries.GetTransportDetail;

/// <summary>
/// Data Transfer Object representing the comprehensive details of a Transport route.
/// </summary>
public record TransportDetailDto(
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
    string Status,
    DateTime CreatedAt);
