using System;
using MediatR;
using TouristSystem.Application.Common.Models;

namespace TouristSystem.Application.Features.Reviews.Queries.GetReviewsList;

/// <summary>
/// CQRS request record to fetch a paginated list of Reviews for a target entity.
/// </summary>
public record GetReviewsListQuery(
    string? ReviewType = null,
    Guid? ReferenceId = null,
    int PageNumber = 1,
    int PageSize = 10) : IRequest<PagedList<ReviewsListDto>>;
