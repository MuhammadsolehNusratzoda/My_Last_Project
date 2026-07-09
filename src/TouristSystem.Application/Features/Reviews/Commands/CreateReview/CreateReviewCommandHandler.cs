using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Reviews.Commands.CreateReview;

/// <summary>
/// Handles CreateReviewCommand requests, adding reviews and dynamically recalculating average ratings.
/// </summary>
public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateReviewCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateReviewCommand request, CancellationToken cancellationToken)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID '{request.UserId}' was not found.");
        }

        if (!Enum.TryParse<ReviewType>(request.ReviewType, true, out var type))
        {
            throw new ArgumentException("Invalid review type.");
        }

        if (type == ReviewType.Place)
        {
            var target = await _unitOfWork.Places.GetByIdAsync(request.ReferenceId, cancellationToken);
            if (target == null) throw new KeyNotFoundException($"Place with ID '{request.ReferenceId}' was not found.");
        }
        else if (type == ReviewType.Hotel)
        {
            var target = await _unitOfWork.Hotels.GetByIdAsync(request.ReferenceId, cancellationToken);
            if (target == null) throw new KeyNotFoundException($"Hotel with ID '{request.ReferenceId}' was not found.");
        }
        else if (type == ReviewType.Restaurant)
        {
            var target = await _unitOfWork.Restaurants.GetByIdAsync(request.ReferenceId, cancellationToken);
            if (target == null) throw new KeyNotFoundException($"Restaurant with ID '{request.ReferenceId}' was not found.");
        }
        else if (type == ReviewType.Guide)
        {
            var target = await _unitOfWork.Guides.GetByIdAsync(request.ReferenceId, cancellationToken);
            if (target == null) throw new KeyNotFoundException($"Guide profile with ID '{request.ReferenceId}' was not found.");
        }

        var review = new Review
        {
            UserId = request.UserId,
            ReviewType = type,
            ReferenceId = request.ReferenceId,
            Rating = request.Rating,
            Comment = request.Comment,
            Status = EntityStatus.Approved
        };

        await _unitOfWork.Reviews.AddAsync(review, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var reviewsData = await _unitOfWork.Reviews.GetPagedAsync(request.ReviewType, request.ReferenceId, 1, 10000, cancellationToken);
        var targetReviews = reviewsData.Items;

        int reviewsCount = targetReviews.Count;
        decimal ratingAverage = reviewsCount > 0 ? (decimal)targetReviews.Average(r => r.Rating) : 0;

        if (type == ReviewType.Place)
        {
            var target = await _unitOfWork.Places.GetByIdAsync(request.ReferenceId, cancellationToken);
            if (target != null)
            {
                target.ReviewsCount = reviewsCount;
                target.RatingAverage = ratingAverage;
                _unitOfWork.Places.Update(target);
            }
        }
        else if (type == ReviewType.Hotel)
        {
            var target = await _unitOfWork.Hotels.GetByIdAsync(request.ReferenceId, cancellationToken);
            if (target != null)
            {
                target.ReviewsCount = reviewsCount;
                target.RatingAverage = ratingAverage;
                _unitOfWork.Hotels.Update(target);
            }
        }
        else if (type == ReviewType.Restaurant)
        {
            var target = await _unitOfWork.Restaurants.GetByIdAsync(request.ReferenceId, cancellationToken);
            if (target != null)
            {
                target.ReviewsCount = reviewsCount;
                target.RatingAverage = ratingAverage;
                _unitOfWork.Restaurants.Update(target);
            }
        }
        else if (type == ReviewType.Guide)
        {
            var target = await _unitOfWork.Guides.GetByIdAsync(request.ReferenceId, cancellationToken);
            if (target != null)
            {
                target.ReviewsCount = reviewsCount;
                target.RatingAverage = ratingAverage;
                _unitOfWork.Guides.Update(target);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return review.Id;
    }
}
