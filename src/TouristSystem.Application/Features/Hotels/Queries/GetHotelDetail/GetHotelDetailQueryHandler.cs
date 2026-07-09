using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Hotels.Queries.GetHotelDetail;

/// <summary>
/// Handles GetHotelDetailQuery requests, resolving targets by ID or slug and mapping them.
/// </summary>
public class GetHotelDetailQueryHandler : IRequestHandler<GetHotelDetailQuery, HotelDetailDto?>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetHotelDetailQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<HotelDetailDto?> Handle(GetHotelDetailQuery request, CancellationToken cancellationToken)
    {
        Hotel? hotel;

        if (Guid.TryParse(request.IdOrSlug, out var id))
        {
            hotel = await _unitOfWork.Hotels.GetByIdAsync(id, cancellationToken);
        }
        else
        {
            hotel = await _unitOfWork.Hotels.GetBySlugAsync(request.IdOrSlug, cancellationToken);
        }

        if (hotel == null)
        {
            return null;
        }

        return new HotelDetailDto(
            hotel.Id,
            hotel.OwnerId,
            hotel.Name,
            hotel.Slug,
            hotel.Description,
            hotel.City,
            hotel.Address,
            hotel.Latitude,
            hotel.Longitude,
            hotel.PhoneNumber,
            hotel.WebsiteUrl,
            hotel.ImageUrl,
            hotel.PricePerNight,
            hotel.Stars,
            hotel.RatingAverage,
            hotel.ReviewsCount,
            hotel.TotalRooms,
            hotel.AvailableRooms,
            hotel.HasWifi,
            hotel.HasParking,
            hotel.HasPool,
            hotel.HasGym,
            hotel.HasRestaurant,
            hotel.IsFamilyFriendly,
            hotel.IsLuxury,
            hotel.IsBudget,
            hotel.Status.ToString(),
            hotel.CreatedAt);
    }
}
