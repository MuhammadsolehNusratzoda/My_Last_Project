using System;
using MediatR;
using TouristSystem.Application.Features.ProviderRegistration.DTOs;

namespace TouristSystem.Application.Features.ProviderRegistration.Commands.SaveRegistrationDraft;

public record SaveRegistrationDraftCommand(
    Guid UserId,
    SaveProviderDraftDto Data) : IRequest<Guid>;
