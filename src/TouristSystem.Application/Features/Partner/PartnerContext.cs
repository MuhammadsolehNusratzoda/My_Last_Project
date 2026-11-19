using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TouristSystem.Application.Interfaces;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Partner;

/// <summary>
/// Resolves "who is the partner" for every Partner Portal request.
/// The partner ID always comes from the JWT (ICurrentUserService), never from the client.
/// </summary>
public static class PartnerContext
{
    /// <summary>Tajikistan is UTC+5 all year (no daylight saving time).</summary>
    public static readonly TimeSpan DushanbeOffset = TimeSpan.FromHours(5);

    public static async Task<User> GetCurrentPartnerAsync(
        ICurrentUserService currentUserService, IUnitOfWork unitOfWork, CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId
            ?? throw new UnauthorizedAccessException("User is not authenticated.");

        var user = await unitOfWork.Users.GetByIdAsync(userId, cancellationToken)
            ?? throw new UnauthorizedAccessException("User account was not found.");

        var allowed = user.Role is UserRole.HotelOwner or UserRole.RestaurantOwner or UserRole.TransportOwner
            or UserRole.Guide or UserRole.Admin or UserRole.SuperAdmin;

        if (!allowed)
        {
            throw new UnauthorizedAccessException("Only partners can use the Partner Portal.");
        }

        return user;
    }

    /// <summary>Start of "today" in Dushanbe, expressed in UTC.</summary>
    public static DateTime TodayStartUtc()
    {
        var localNow = DateTime.UtcNow + DushanbeOffset;
        return DateTime.SpecifyKind(localNow.Date - DushanbeOffset, DateTimeKind.Utc);
    }

    public static int Nights(DateTime start, DateTime end)
    {
        var nights = (int)(end.Date - start.Date).TotalDays;
        return nights < 1 ? 1 : nights;
    }

    /// <summary>Id → (name, city) of every listing the partner owns, used to label bookings.</summary>
    public static async Task<Dictionary<Guid, (string Name, string? City)>> BuildListingLookupAsync(
        IUnitOfWork unitOfWork, User partner, CancellationToken cancellationToken)
    {
        var lookup = new Dictionary<Guid, (string Name, string? City)>();

        foreach (var hotel in await unitOfWork.Hotels.GetByOwnerAsync(partner.Id, cancellationToken))
            lookup[hotel.Id] = (hotel.Name, hotel.City);

        foreach (var restaurant in await unitOfWork.Restaurants.GetByOwnerAsync(partner.Id, cancellationToken))
            lookup[restaurant.Id] = (restaurant.Name, restaurant.City);

        foreach (var transport in await unitOfWork.Transports.GetByOwnerAsync(partner.Id, cancellationToken))
            lookup[transport.Id] = ($"{transport.Name} ({transport.OriginCity} → {transport.DestinationCity})", transport.OriginCity);

        var guide = await unitOfWork.Guides.GetByUserIdAsync(partner.Id, cancellationToken);
        if (guide != null)
            lookup[guide.Id] = (partner.FullName, guide.City);

        return lookup;
    }
}
