using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Common.Models;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Reviews.Queries.GetReviewsList;

/// <summary>
/// Handles GetReviewsListQuery requests, returning mapped paged lists of Reviews.
/// </summary>
public class GetReviewsListQueryHandler : IRequestHandler<GetReviewsListQuery, PagedList<ReviewsListDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetReviewsListQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedList<ReviewsListDto>> Handle(GetReviewsListQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _unitOfWork.Reviews.GetPagedAsync(
            request.ReviewType,
            request.ReferenceId,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        var dtos = items.Select(x => new ReviewsListDto(
            x.Id,
            x.UserId,
            x.User.FullName,
            null,
            x.ReviewType.ToString(),
            x.ReferenceId,
            x.Rating,
            x.Comment,
            x.CreatedAt
        )).ToList();

        return new PagedList<ReviewsListDto>(dtos, totalCount, request.PageNumber, request.PageSize);
    }
}
