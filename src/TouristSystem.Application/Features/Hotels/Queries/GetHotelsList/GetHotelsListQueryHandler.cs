using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Common.Models;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Hotels.Queries.GetHotelsList;

/// <summary>
/// Handles GetHotelsListQuery requests, returning mapped paged lists of Hotels.
/// </summary>
public class GetHotelsListQueryHandler : IRequestHandler<GetHotelsListQuery, PagedList<HotelsListDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetHotelsListQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedList<HotelsListDto>> Handle(GetHotelsListQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _unitOfWork.Hotels.GetPagedAsync(
            request.SearchTerm,
            request.City,
            request.MinPrice,
            request.MaxPrice,
            request.Stars,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        var dtos = items.Select(x => new HotelsListDto(
            x.Id,
            x.Name,
            x.Slug,
            x.City,
            x.Address,
            x.ImageUrl,
            x.PricePerNight,
            x.Stars,
            x.RatingAverage,
            x.ReviewsCount,
            x.AvailableRooms
        )).ToList();

        return new PagedList<HotelsListDto>(dtos, totalCount, request.PageNumber, request.PageSize);
    }
}
