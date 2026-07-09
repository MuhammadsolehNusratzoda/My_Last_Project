using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Common.Models;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Restaurants.Queries.GetRestaurantsList;

/// <summary>
/// Handles GetRestaurantsListQuery requests, returning mapped paged lists of Restaurants.
/// </summary>
public class GetRestaurantsListQueryHandler : IRequestHandler<GetRestaurantsListQuery, PagedList<RestaurantsListDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetRestaurantsListQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedList<RestaurantsListDto>> Handle(GetRestaurantsListQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _unitOfWork.Restaurants.GetPagedAsync(
            request.SearchTerm,
            request.City,
            request.CuisineType,
            request.PriceRange,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        var dtos = items.Select(x => new RestaurantsListDto(
            x.Id,
            x.Name,
            x.Slug,
            x.City,
            x.Address,
            x.ImageUrl,
            x.CuisineType,
            x.PriceRange.ToString(),
            x.OpeningHours,
            x.RatingAverage,
            x.ReviewsCount
        )).ToList();

        return new PagedList<RestaurantsListDto>(dtos, totalCount, request.PageNumber, request.PageSize);
    }
}
