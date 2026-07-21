using System;
using MediatR;

namespace TouristSystem.Application.Features.AdminProviders.Commands.ApproveProviderApplication;

public record ApproveProviderApplicationCommand(Guid ProviderId, string? AdminNotes) : IRequest;
