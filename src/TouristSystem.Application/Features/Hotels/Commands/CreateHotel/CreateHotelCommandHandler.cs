using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Hotels.Commands.CreateHotel;

/// <summary>
/// Handles CreateHotelCommand requests, creating a Hotel and verifying owner accounts.
/// </summary>
public class CreateHotelCommandHandler : IRequestHandler<CreateHotelCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateHotelCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateHotelCommand request, CancellationToken cancellationToken)
    {
        var owner = await _unitOfWork.Users.GetByIdAsync(request.OwnerId, cancellationToken);
        if (owner == null)
        {
            throw new KeyNotFoundException($"Owner User with ID '{request.OwnerId}' was not found.");
        }

        var baseSlug = GenerateSlug(request.Name);
        var slug = baseSlug;
        int suffix = 1;

        while (await _unitOfWork.Hotels.GetBySlugAsync(slug, cancellationToken) != null)
        {
            slug = $"{baseSlug}-{suffix++}";
        }

        var hotel = new Hotel
        {
            OwnerId = request.OwnerId,
            Name = request.Name,
            Slug = slug,
            Description = request.Description,
            City = request.City,
            Address = request.Address,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            PhoneNumber = request.PhoneNumber,
            WebsiteUrl = request.WebsiteUrl,
            ImageUrl = request.ImageUrl,
            PricePerNight = request.PricePerNight,
            Stars = request.Stars,
            TotalRooms = request.TotalRooms,
            AvailableRooms = request.TotalRooms,
            HasWifi = request.HasWifi,
            HasParking = request.HasParking,
            HasPool = request.HasPool,
            HasGym = request.HasGym,
            HasRestaurant = request.HasRestaurant,
            IsFamilyFriendly = request.IsFamilyFriendly,
            IsLuxury = request.IsLuxury,
            IsBudget = request.IsBudget,
            Status = EntityStatus.Approved
        };

        await _unitOfWork.Hotels.AddAsync(hotel, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return hotel.Id;
    }

    private string GenerateSlug(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return string.Empty;

        string slug = name.ToLowerInvariant();
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"\s+", "-").Trim('-');
        return slug;
    }
}
