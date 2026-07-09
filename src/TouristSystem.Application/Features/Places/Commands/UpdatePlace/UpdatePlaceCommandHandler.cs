using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Places.Commands.UpdatePlace;

/// <summary>
/// Handles UpdatePlaceCommand requests, applying edits and updating slugs.
/// </summary>
public class UpdatePlaceCommandHandler : IRequestHandler<UpdatePlaceCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdatePlaceCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(UpdatePlaceCommand request, CancellationToken cancellationToken)
    {
        var place = await _unitOfWork.Places.GetByIdAsync(request.Id, cancellationToken);

        if (place == null)
        {
            throw new KeyNotFoundException($"Tourist Place with ID '{request.Id}' was not found.");
        }

        if (!place.Name.Equals(request.Name, StringComparison.OrdinalIgnoreCase))
        {
            var baseSlug = GenerateSlug(request.Name);
            var slug = baseSlug;
            int suffix = 1;

            while (await _unitOfWork.Places.GetBySlugAsync(slug, cancellationToken) is var existing && existing != null && existing.Id != place.Id)
            {
                slug = $"{baseSlug}-{suffix++}";
            }

            place.Slug = slug;
        }

        place.Name = request.Name;
        place.Description = request.Description;
        place.City = request.City;
        place.Address = request.Address;
        place.Latitude = request.Latitude;
        place.Longitude = request.Longitude;
        place.ImageUrl = request.ImageUrl;
        place.EntryFee = request.EntryFee;

        if (Enum.TryParse<EntityStatus>(request.Status, true, out var status))
        {
            place.Status = status;
        }

        _unitOfWork.Places.Update(place);
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
