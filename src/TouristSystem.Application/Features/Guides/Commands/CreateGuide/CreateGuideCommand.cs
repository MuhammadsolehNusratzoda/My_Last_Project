using System;
using MediatR;

namespace TouristSystem.Application.Features.Guides.Commands.CreateGuide;

/// <summary>
/// CQRS request record to create a new Guide profile.
/// </summary>
public record CreateGuideCommand(
    Guid UserId,
    string Bio,
    string Languages,
    string City,
    decimal PricePerDay,
    int ExperienceYears,
    string? ImageUrl) : IRequest<Guid>;
