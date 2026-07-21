using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.AdminProviders.Commands.ApproveProviderApplication;

public class ApproveProviderApplicationCommandHandler : IRequestHandler<ApproveProviderApplicationCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public ApproveProviderApplicationCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(ApproveProviderApplicationCommand request, CancellationToken cancellationToken)
    {
        var profile = await _unitOfWork.TransportProviders.GetDetailByIdAsync(request.ProviderId, cancellationToken);
        if (profile == null) throw new KeyNotFoundException("Provider application not found.");

        profile.ApplicationStatus = ApplicationStatus.Approved;
        profile.DriverStatus = DriverStatus.Available;
        profile.ReviewedAt = DateTime.UtcNow;
        if (!string.IsNullOrWhiteSpace(request.AdminNotes))
        {
            profile.AdminInternalNotes = request.AdminNotes;
        }

        // Auto-verify all checklists on explicit admin approval
        profile.IsIdentityVerified = true;
        profile.IsLicenseVerified = true;
        profile.IsVehicleVerified = true;
        profile.IsInsuranceVerified = true;
        profile.IsCompanyVerified = true;

        // Promote user role to TransportOwner
        var user = await _unitOfWork.Users.GetByIdAsync(profile.UserId, cancellationToken);
        if (user != null && user.Role == UserRole.Tourist)
        {
            user.Role = UserRole.TransportOwner;
            _unitOfWork.Users.Update(user);
        }

        _unitOfWork.TransportProviders.Update(profile);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
