using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.AdminProviders.Commands.RejectProviderApplication;

public class RejectProviderApplicationCommandHandler : IRequestHandler<RejectProviderApplicationCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public RejectProviderApplicationCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(RejectProviderApplicationCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.RejectionReason))
            throw new ArgumentException("A mandatory rejection reason must be provided.");

        var profile = await _unitOfWork.TransportProviders.GetDetailByIdAsync(request.ProviderId, cancellationToken);
        if (profile == null) throw new KeyNotFoundException("Provider application not found.");

        profile.ApplicationStatus = ApplicationStatus.Rejected;
        profile.DriverStatus = DriverStatus.Offline;
        profile.RejectionReason = request.RejectionReason;
        profile.ReviewedAt = DateTime.UtcNow;
        if (!string.IsNullOrWhiteSpace(request.AdminNotes))
        {
            profile.AdminInternalNotes = request.AdminNotes;
        }

        _unitOfWork.TransportProviders.Update(profile);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
