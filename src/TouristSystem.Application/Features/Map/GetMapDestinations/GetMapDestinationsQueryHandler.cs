using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Map.GetMapDestinations;

/// <summary>
/// Queries all Places, Hotels, and Restaurants that have valid coordinates,
/// and merges them into a single flat list of MapDestinationDto.
/// </summary>
public class GetMapDestinationsQueryHandler
    : IRequestHandler<GetMapDestinationsQuery, IReadOnlyList<MapDestinationDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetMapDestinationsQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<MapDestinationDto>> Handle(
        GetMapDestinationsQuery request,
        CancellationToken cancellationToken)
    {
        var places      = await _unitOfWork.Places.GetAllAsync(cancellationToken);
        var hotels      = await _unitOfWork.Hotels.GetAllAsync(cancellationToken);
        var restaurants = await _unitOfWork.Restaurants.GetAllAsync(cancellationToken);

        var results = new List<MapDestinationDto>();

        foreach (var p in places.Where(p => p.Latitude.HasValue && p.Longitude.HasValue))
        {
            results.Add(new MapDestinationDto(
                p.Id,
                p.Name,
                "place",
                p.City,
                p.Latitude!.Value,
                p.Longitude!.Value,
                p.ImageUrl,
                p.Description));
        }

        foreach (var h in hotels.Where(h => h.Latitude.HasValue && h.Longitude.HasValue))
        {
            results.Add(new MapDestinationDto(
                h.Id,
                h.Name,
                "hotel",
                h.City,
                h.Latitude!.Value,
                h.Longitude!.Value,
                h.ImageUrl,
                h.Description));
        }

        foreach (var r in restaurants.Where(r => r.Latitude.HasValue && r.Longitude.HasValue))
        {
            results.Add(new MapDestinationDto(
                r.Id,
                r.Name,
                "restaurant",
                r.City,
                r.Latitude!.Value,
                r.Longitude!.Value,
                r.ImageUrl,
                r.Description));
        }

        return results.AsReadOnly();
    }
}
