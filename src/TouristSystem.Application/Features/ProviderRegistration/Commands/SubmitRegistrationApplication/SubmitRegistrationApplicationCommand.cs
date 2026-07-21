using System;
using MediatR;
using TouristSystem.Application.Features.ProviderRegistration.DTOs;

namespace TouristSystem.Application.Features.ProviderRegistration.Commands.SubmitRegistrationApplication;

public record SubmitRegistrationApplicationCommand(
    Guid UserId,
    SaveProviderDraftDto Data) : IRequest<Guid>;
