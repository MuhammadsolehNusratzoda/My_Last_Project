using System;
using MediatR;

namespace TouristSystem.Application.Features.Places.Commands.CreatePlace;

/// <summary>
/// CQRS request record to create a new tourist Place.
/// </summary>
public record CreatePlaceCommand(
    string Name,
    string Description,
    string City,
    string? Address,
    decimal? Latitude,
    decimal? Longitude,
    string? ImageUrl,
    decimal EntryFee) : IRequest<Guid>;
