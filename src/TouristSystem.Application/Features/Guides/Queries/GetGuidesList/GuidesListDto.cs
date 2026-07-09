using System;

namespace TouristSystem.Application.Features.Guides.Queries.GetGuidesList;

/// <summary>
/// Data Transfer Object representing a summary of a verified tour Guide for listings.
/// </summary>
public record GuidesListDto(
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
    bool IsAvailable);
