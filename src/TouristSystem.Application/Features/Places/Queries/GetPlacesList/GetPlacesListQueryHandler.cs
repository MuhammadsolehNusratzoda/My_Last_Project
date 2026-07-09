using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Common.Models;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Places.Queries.GetPlacesList;

/// <summary>
/// Handles GetPlacesListQuery requests, returning mapped paginated lists of tourist Places.
/// </summary>
public class GetPlacesListQueryHandler : IRequestHandler<GetPlacesListQuery, PagedList<PlacesListDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetPlacesListQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedList<PlacesListDto>> Handle(GetPlacesListQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _unitOfWork.Places.GetPagedAsync(
            request.SearchTerm,
            request.City,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        var dtos = items.Select(x => new PlacesListDto(
            x.Id,
            x.Name,
            x.Slug,
            x.City,
            x.ImageUrl,
            x.EntryFee,
            x.RatingAverage,
            x.ReviewsCount
        )).ToList();

        return new PagedList<PlacesListDto>(dtos, totalCount, request.PageNumber, request.PageSize);
    }
}
