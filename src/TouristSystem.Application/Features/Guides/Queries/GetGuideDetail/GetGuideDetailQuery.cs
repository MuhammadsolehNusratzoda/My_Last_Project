using System;
using MediatR;

namespace TouristSystem.Application.Features.Guides.Queries.GetGuideDetail;

/// <summary>
/// CQRS request record to fetch details of a tour Guide profile by guide ID or user ID.
/// </summary>
public record GetGuideDetailQuery(Guid IdOrUserId) : IRequest<GuideDetailDto?>;
