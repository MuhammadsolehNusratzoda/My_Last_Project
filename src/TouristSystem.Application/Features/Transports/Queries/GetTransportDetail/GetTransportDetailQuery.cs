using System;
using MediatR;

namespace TouristSystem.Application.Features.Transports.Queries.GetTransportDetail;

/// <summary>
/// CQRS request record to fetch details of a Transport by ID.
/// </summary>
public record GetTransportDetailQuery(Guid Id) : IRequest<TransportDetailDto?>;
