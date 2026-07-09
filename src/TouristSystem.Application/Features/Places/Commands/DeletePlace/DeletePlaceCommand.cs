using System;
using MediatR;

namespace TouristSystem.Application.Features.Places.Commands.DeletePlace;

/// <summary>
/// CQRS request record to delete a tourist Place.
/// </summary>
public record DeletePlaceCommand(Guid Id) : IRequest;
