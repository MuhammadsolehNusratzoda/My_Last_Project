using System;
using MediatR;

namespace TouristSystem.Application.Features.Places.Commands.UpdatePlace;

/// <summary>
/// CQRS request record to update an existing tourist Place.
/// </summary>
public record UpdatePlaceCommand(
    Guid Id,
    string Name,
    string Description,
    string City,
    string? Address,
    decimal? Latitude,
    decimal? Longitude,
    string? ImageUrl,
    decimal EntryFee,
    string Status) : IRequest;
