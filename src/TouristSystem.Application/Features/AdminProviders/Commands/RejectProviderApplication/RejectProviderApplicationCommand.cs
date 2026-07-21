using System;
using MediatR;

namespace TouristSystem.Application.Features.AdminProviders.Commands.RejectProviderApplication;

public record RejectProviderApplicationCommand(Guid ProviderId, string RejectionReason, string? AdminNotes) : IRequest;
