using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Places.Queries.GetPlaceDetail;

/// <summary>
/// Handles GetPlaceDetailQuery requests, resolving targets by ID or slug and mapping them.
/// </summary>
public class GetPlaceDetailQueryHandler : IRequestHandler<GetPlaceDetailQuery, PlaceDetailDto?>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetPlaceDetailQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PlaceDetailDto?> Handle(GetPlaceDetailQuery request, CancellationToken cancellationToken)
    {
        Place? place;

        if (Guid.TryParse(request.IdOrSlug, out var id))
        {
            place = await _unitOfWork.Places.GetByIdAsync(id, cancellationToken);
        }
        else
        {
            place = await _unitOfWork.Places.GetBySlugAsync(request.IdOrSlug, cancellationToken);
        }

        if (place == null)
        {
            return null;
        }

        return new PlaceDetailDto(
            place.Id,
            place.Name,
            place.Slug,
            place.Description,
            place.City,
            place.Address,
            place.Latitude,
            place.Longitude,
            place.ImageUrl,
            place.EntryFee,
            place.RatingAverage,
            place.ReviewsCount,
            place.Status.ToString(),
            place.CreatedAt);
    }
}
