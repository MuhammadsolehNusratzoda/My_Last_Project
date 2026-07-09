using System;
using MediatR;

namespace TouristSystem.Application.Features.Guides.Commands.UpdateGuide;

/// <summary>
/// CQRS request record to update an existing Guide profile.
/// </summary>
public record UpdateGuideCommand(
    Guid Id,
    Guid UserId,
    string Bio,
    string Languages,
    string City,
    decimal PricePerDay,
    int ExperienceYears,
    string? ImageUrl,
    bool IsAvailable,
    string Status) : IRequest;
