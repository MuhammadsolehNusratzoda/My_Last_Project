using System;
using MediatR;
using TouristSystem.Application.Features.ProviderRegistration.DTOs;

namespace TouristSystem.Application.Features.ProviderRegistration.Queries.GetMyProviderApplication;

public record GetMyProviderApplicationQuery(Guid UserId) : IRequest<ProviderApplicationDossierDto?>;
