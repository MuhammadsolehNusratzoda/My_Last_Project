using System;
using MediatR;

namespace TouristSystem.Application.Features.Guides.Commands.DeleteGuide;

/// <summary>
/// CQRS request record to delete a Guide profile.
/// </summary>
public record DeleteGuideCommand(Guid Id) : IRequest;
