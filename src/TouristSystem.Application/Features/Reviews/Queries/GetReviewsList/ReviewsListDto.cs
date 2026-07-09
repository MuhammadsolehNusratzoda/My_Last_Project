using System;

namespace TouristSystem.Application.Features.Reviews.Queries.GetReviewsList;

/// <summary>
/// Data Transfer Object representing a summary of a Review for lists.
/// </summary>
public record ReviewsListDto(
    Guid Id,
    Guid UserId,
    string UserName,
    string? UserImageUrl,
    string ReviewType,
    Guid ReferenceId,
    int Rating,
    string Comment,
    DateTime CreatedAt);
