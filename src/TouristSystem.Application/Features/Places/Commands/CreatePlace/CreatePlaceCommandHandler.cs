using System;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Places.Commands.CreatePlace;

/// <summary>
/// Handles CreatePlaceCommand requests, generating URL-friendly slugs and saving the Place entity.
/// </summary>
public class CreatePlaceCommandHandler : IRequestHandler<CreatePlaceCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreatePlaceCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreatePlaceCommand request, CancellationToken cancellationToken)
    {
        var baseSlug = GenerateSlug(request.Name);
        var slug = baseSlug;
        
        // Resolve slug conflicts
        int suffix = 1;
        while (await _unitOfWork.Places.GetBySlugAsync(slug, cancellationToken) != null)
        {
            slug = $"{baseSlug}-{suffix++}";
        }

        var place = new Place
        {
            Name = request.Name,
            Slug = slug,
            Description = request.Description,
            City = request.City,
            Address = request.Address,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            ImageUrl = request.ImageUrl,
            EntryFee = request.EntryFee,
            Status = EntityStatus.Approved
        };

        await _unitOfWork.Places.AddAsync(place, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return place.Id;
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
