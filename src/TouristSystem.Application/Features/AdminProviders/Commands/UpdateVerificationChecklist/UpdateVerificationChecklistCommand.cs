using System;
using MediatR;

namespace TouristSystem.Application.Features.AdminProviders.Commands.UpdateVerificationChecklist;

public record UpdateVerificationChecklistCommand(
    Guid ProviderId,
    bool IsIdentityVerified,
    bool IsLicenseVerified,
    bool IsVehicleVerified,
    bool IsInsuranceVerified,
    bool IsCompanyVerified) : IRequest;
