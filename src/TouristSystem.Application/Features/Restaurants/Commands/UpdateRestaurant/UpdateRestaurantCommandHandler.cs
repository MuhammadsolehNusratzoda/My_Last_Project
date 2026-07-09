using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Interfaces;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Restaurants.Commands.UpdateRestaurant;

/// <summary>
/// Handles UpdateRestaurantCommand requests, enforcing authorization checks.
/// </summary>
public class UpdateRestaurantCommandHandler : IRequestHandler<UpdateRestaurantCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public UpdateRestaurantCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task Handle(UpdateRestaurantCommand request, CancellationToken cancellationToken)
    {
        var restaurant = await _unitOfWork.Restaurants.GetByIdAsync(request.Id, cancellationToken);

        if (restaurant == null)
        {
            throw new KeyNotFoundException($"Restaurant with ID '{request.Id}' was not found.");
        }

        var currentUserId = _currentUserService.UserId;
        if (currentUserId == null)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var currentUser = await _unitOfWork.Users.GetByIdAsync(currentUserId.Value, cancellationToken);
        bool isAdmin = currentUser != null && (currentUser.Role == UserRole.Admin || currentUser.Role == UserRole.SuperAdmin);

        if (restaurant.OwnerId != currentUserId.Value && !isAdmin)
        {
            throw new UnauthorizedAccessException("You are not authorized to edit this dining listing.");
        }

        if (!restaurant.Name.Equals(request.Name, StringComparison.OrdinalIgnoreCase))
        {
            var baseSlug = GenerateSlug(request.Name);
            var slug = baseSlug;
            int suffix = 1;

            while (await _unitOfWork.Restaurants.GetBySlugAsync(slug, cancellationToken) is var existing && existing != null && existing.Id != restaurant.Id)
            {
                slug = $"{baseSlug}-{suffix++}";
            }

            restaurant.Slug = slug;
        }

        restaurant.Name = request.Name;
        restaurant.Description = request.Description;
        restaurant.City = request.City;
        restaurant.Address = request.Address;
        restaurant.Latitude = request.Latitude;
        restaurant.Longitude = request.Longitude;
        restaurant.PhoneNumber = request.PhoneNumber;
        restaurant.WebsiteUrl = request.WebsiteUrl;
        restaurant.ImageUrl = request.ImageUrl;
        restaurant.CuisineType = request.CuisineType;
        restaurant.OpeningHours = request.OpeningHours;
        restaurant.HasDelivery = request.HasDelivery;
        restaurant.HasWifi = request.HasWifi;
        restaurant.HasParking = request.HasParking;

        if (Enum.TryParse<PriceRange>(request.PriceRange, true, out var price))
        {
            restaurant.PriceRange = price;
        }

        if (Enum.TryParse<EntityStatus>(request.Status, true, out var status))
        {
            restaurant.Status = status;
        }

        _unitOfWork.Restaurants.Update(restaurant);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
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
