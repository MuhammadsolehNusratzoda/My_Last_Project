using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Common.Models;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Guides.Queries.GetGuidesList;

/// <summary>
/// Handles GetGuidesListQuery requests, returning mapped paged lists of Guides.
/// </summary>
public class GetGuidesListQueryHandler : IRequestHandler<GetGuidesListQuery, PagedList<GuidesListDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetGuidesListQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedList<GuidesListDto>> Handle(GetGuidesListQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _unitOfWork.Guides.GetPagedAsync(
            request.SearchTerm,
            request.City,
            request.Language,
            request.MaxPricePerDay,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        var dtos = items.Select(x => new GuidesListDto(
            x.Id,
            x.UserId,
            x.User.FullName,
            x.User.Email,
            x.Bio,
            x.Languages,
            x.City,
            x.PricePerDay,
            x.ExperienceYears,
            x.RatingAverage,
            x.ReviewsCount,
            x.ImageUrl,
            x.IsAvailable
        )).ToList();

        return new PagedList<GuidesListDto>(dtos, totalCount, request.PageNumber, request.PageSize);
    }
}
