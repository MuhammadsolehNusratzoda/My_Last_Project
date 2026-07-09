using System;
using MediatR;

namespace TouristSystem.Application.Features.Transports.Commands.DeleteTransport;

/// <summary>
/// CQRS request record to delete a Transport vehicle.
/// </summary>
public record DeleteTransportCommand(Guid Id) : IRequest;
