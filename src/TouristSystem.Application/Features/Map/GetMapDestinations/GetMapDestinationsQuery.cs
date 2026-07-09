using System.Collections.Generic;
using MediatR;

namespace TouristSystem.Application.Features.Map.GetMapDestinations;

/// <summary>
/// Returns all mappable destinations (places, hotels, restaurants) that have coordinates.
/// </summary>
public record GetMapDestinationsQuery : IRequest<IReadOnlyList<MapDestinationDto>>;
