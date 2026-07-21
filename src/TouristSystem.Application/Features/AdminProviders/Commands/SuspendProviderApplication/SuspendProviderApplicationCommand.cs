using System;
using MediatR;

namespace TouristSystem.Application.Features.AdminProviders.Commands.SuspendProviderApplication;

public record SuspendProviderApplicationCommand(Guid ProviderId, string Reason) : IRequest;
