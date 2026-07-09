using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Interfaces;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Hotels.Commands.UpdateHotel;

/// <summary>
/// Handles UpdateHotelCommand requests, enforcing authorization ownership boundaries.
/// </summary>
public class UpdateHotelCommandHandler : IRequestHandler<UpdateHotelCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public UpdateHotelCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task Handle(UpdateHotelCommand request, CancellationToken cancellationToken)
    {
        var hotel = await _unitOfWork.Hotels.GetByIdAsync(request.Id, cancellationToken);

        if (hotel == null)
        {
            throw new KeyNotFoundException($"Hotel with ID '{request.Id}' was not found.");
        }

        var currentUserId = _currentUserService.UserId;
        if (currentUserId == null)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var currentUser = await _unitOfWork.Users.GetByIdAsync(currentUserId.Value, cancellationToken);
        bool isAdmin = currentUser != null && (currentUser.Role == UserRole.Admin || currentUser.Role == UserRole.SuperAdmin);

        if (hotel.OwnerId != currentUserId.Value && !isAdmin)
        {
            throw new UnauthorizedAccessException("You are not authorized to edit this lodging listing.");
        }

        if (!hotel.Name.Equals(request.Name, StringComparison.OrdinalIgnoreCase))
        {
            var baseSlug = GenerateSlug(request.Name);
            var slug = baseSlug;
            int suffix = 1;

            while (await _unitOfWork.Hotels.GetBySlugAsync(slug, cancellationToken) is var existing && existing != null && existing.Id != hotel.Id)
            {
                slug = $"{baseSlug}-{suffix++}";
            }

            hotel.Slug = slug;
        }

        hotel.Name = request.Name;
        hotel.Description = request.Description;
        hotel.City = request.City;
        hotel.Address = request.Address;
        hotel.Latitude = request.Latitude;
        hotel.Longitude = request.Longitude;
        hotel.PhoneNumber = request.PhoneNumber;
        hotel.WebsiteUrl = request.WebsiteUrl;
        hotel.ImageUrl = request.ImageUrl;
        hotel.PricePerNight = request.PricePerNight;
        hotel.Stars = request.Stars;
        hotel.TotalRooms = request.TotalRooms;
        hotel.AvailableRooms = request.AvailableRooms;
        hotel.HasWifi = request.HasWifi;
        hotel.HasParking = request.HasParking;
        hotel.HasPool = request.HasPool;
        hotel.HasGym = request.HasGym;
        hotel.HasRestaurant = request.HasRestaurant;
        hotel.IsFamilyFriendly = request.IsFamilyFriendly;
        hotel.IsLuxury = request.IsLuxury;
        hotel.IsBudget = request.IsBudget;

        if (Enum.TryParse<EntityStatus>(request.Status, true, out var status))
        {
            hotel.Status = status;
        }

        _unitOfWork.Hotels.Update(hotel);
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
