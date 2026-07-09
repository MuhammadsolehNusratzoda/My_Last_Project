using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Restaurants.Commands.CreateRestaurant;

/// <summary>
/// Handles CreateRestaurantCommand requests, verifying owner credentials and saving the entity.
/// </summary>
public class CreateRestaurantCommandHandler : IRequestHandler<CreateRestaurantCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateRestaurantCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateRestaurantCommand request, CancellationToken cancellationToken)
    {
        var owner = await _unitOfWork.Users.GetByIdAsync(request.OwnerId, cancellationToken);
        if (owner == null)
        {
            throw new KeyNotFoundException($"Owner User with ID '{request.OwnerId}' was not found.");
        }

        var baseSlug = GenerateSlug(request.Name);
        var slug = baseSlug;
        int suffix = 1;

        while (await _unitOfWork.Restaurants.GetBySlugAsync(slug, cancellationToken) != null)
        {
            slug = $"{baseSlug}-{suffix++}";
        }

        if (!Enum.TryParse<PriceRange>(request.PriceRange, true, out var price))
        {
            price = PriceRange.Medium;
        }

        var restaurant = new Restaurant
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
            CuisineType = request.CuisineType,
            PriceRange = price,
            OpeningHours = request.OpeningHours,
            HasDelivery = request.HasDelivery,
            HasWifi = request.HasWifi,
            HasParking = request.HasParking,
            Status = EntityStatus.Approved
        };

        await _unitOfWork.Restaurants.AddAsync(restaurant, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return restaurant.Id;
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
