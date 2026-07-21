using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.AdminProviders.Commands.UpdateVerificationChecklist;

public class UpdateVerificationChecklistCommandHandler : IRequestHandler<UpdateVerificationChecklistCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public UpdateVerificationChecklistCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(UpdateVerificationChecklistCommand request, CancellationToken cancellationToken)
    {
        var profile = await _unitOfWork.TransportProviders.GetDetailByIdAsync(request.ProviderId, cancellationToken);
        if (profile == null) throw new KeyNotFoundException("Provider application not found.");

        profile.IsIdentityVerified = request.IsIdentityVerified;
        profile.IsLicenseVerified = request.IsLicenseVerified;
        profile.IsVehicleVerified = request.IsVehicleVerified;
        profile.IsInsuranceVerified = request.IsInsuranceVerified;
        profile.IsCompanyVerified = request.IsCompanyVerified;

        _unitOfWork.TransportProviders.Update(profile);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
