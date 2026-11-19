using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Interfaces;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Partner.Queries;

/// <summary>All listings owned by the current partner — filtered in the database, not in the browser.</summary>
public record GetPartnerListingsQuery : IRequest<IReadOnlyList<PartnerListingDto>>;

public class GetPartnerListingsQueryHandler : IRequestHandler<GetPartnerListingsQuery, IReadOnlyList<PartnerListingDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public GetPartnerListingsQueryHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<IReadOnlyList<PartnerListingDto>> Handle(GetPartnerListingsQuery request, CancellationToken cancellationToken)
    {
        var partner = await PartnerContext.GetCurrentPartnerAsync(_currentUserService, _unitOfWork, cancellationToken);
        var result = new List<PartnerListingDto>();

        foreach (var h in await _unitOfWork.Hotels.GetByOwnerAsync(partner.Id, cancellationToken))
        {
            result.Add(new PartnerListingDto(h.Id, "Hotel", h.Name, h.City, h.Status.ToString(), h.ImageUrl,
                h.PricePerNight, "night", h.TotalRooms, h.AvailableRooms, h.RatingAverage, h.CreatedAt));
        }

        foreach (var r in await _unitOfWork.Restaurants.GetByOwnerAsync(partner.Id, cancellationToken))
        {
            result.Add(new PartnerListingDto(r.Id, "Restaurant", r.Name, r.City, r.Status.ToString(), r.ImageUrl,
                null, null, null, null, r.RatingAverage, r.CreatedAt));
        }

        foreach (var t in await _unitOfWork.Transports.GetByOwnerAsync(partner.Id, cancellationToken))
        {
            result.Add(new PartnerListingDto(t.Id, "Transport", $"{t.Name} ({t.OriginCity} → {t.DestinationCity})",
                t.OriginCity, t.Status.ToString(), null, t.PricePerSeat, "seat", t.TotalSeats, t.AvailableSeats, 0m, t.CreatedAt));
        }

        var guide = await _unitOfWork.Guides.GetByUserIdAsync(partner.Id, cancellationToken);
        if (guide != null)
        {
            result.Add(new PartnerListingDto(guide.Id, "Guide", partner.FullName, guide.City, guide.Status.ToString(),
                guide.ImageUrl, guide.PricePerDay, "day", null, null, guide.RatingAverage, guide.CreatedAt));
        }

        return result;
    }
}
