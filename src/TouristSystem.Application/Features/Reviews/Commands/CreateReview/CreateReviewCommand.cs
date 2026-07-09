using System;
using MediatR;

namespace TouristSystem.Application.Features.Reviews.Commands.CreateReview;

/// <summary>
/// CQRS request record to post a new Review.
/// </summary>
public record CreateReviewCommand(
    Guid UserId,
    string ReviewType,
    Guid ReferenceId,
    int Rating,
    string Comment) : IRequest<Guid>;
