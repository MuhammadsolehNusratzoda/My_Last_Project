using System;

namespace TouristSystem.Application.Features.Guides.Queries.GetGuideDetail;

/// <summary>
/// Data Transfer Object representing the comprehensive details of a Guide profile.
/// </summary>
public record GuideDetailDto(
    Guid Id,
    Guid UserId,
    string GuideName,
    string GuideEmail,
    string Bio,
    string Languages,
    string City,
    decimal PricePerDay,
    int ExperienceYears,
    decimal RatingAverage,
    int ReviewsCount,
    string? ImageUrl,
    bool IsAvailable,
    string Status,
    DateTime CreatedAt);
