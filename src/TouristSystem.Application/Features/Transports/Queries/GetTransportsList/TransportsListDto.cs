using System;

namespace TouristSystem.Application.Features.Transports.Queries.GetTransportsList;

/// <summary>
/// Data Transfer Object representing a summary of a transport route listing.
/// </summary>
public record TransportsListDto(
    Guid Id,
    string Name,
    string Type,
    string OriginCity,
    string DestinationCity,
    DateTime DepartureTime,
    DateTime ArrivalTime,
    decimal PricePerSeat,
    int TotalSeats,
    int AvailableSeats,
    string VehicleNumber);
