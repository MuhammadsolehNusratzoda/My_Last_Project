using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Guides.Queries.GetGuideDetail;

/// <summary>
/// Handles GetGuideDetailQuery requests, resolving targets by guide ID or user ID.
/// </summary>
public class GetGuideDetailQueryHandler : IRequestHandler<GetGuideDetailQuery, GuideDetailDto?>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetGuideDetailQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<GuideDetailDto?> Handle(GetGuideDetailQuery request, CancellationToken cancellationToken)
    {
        var guide = await _unitOfWork.Guides.GetWithUserByIdAsync(request.IdOrUserId, cancellationToken);

        if (guide == null)
        {
            var userGuide = await _unitOfWork.Guides.GetByUserIdAsync(request.IdOrUserId, cancellationToken);
            if (userGuide != null)
            {
                guide = await _unitOfWork.Guides.GetWithUserByIdAsync(userGuide.Id, cancellationToken);
            }
        }

        if (guide == null)
        {
            return null;
        }

        return new GuideDetailDto(
            guide.Id,
            guide.UserId,
            guide.User.FullName,
            guide.User.Email,
            guide.Bio,
            guide.Languages,
            guide.City,
            guide.PricePerDay,
            guide.ExperienceYears,
            guide.RatingAverage,
            guide.ReviewsCount,
            guide.ImageUrl,
            guide.IsAvailable,
            guide.Status.ToString(),
            guide.CreatedAt);
    }
}
