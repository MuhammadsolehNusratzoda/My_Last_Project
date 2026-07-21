using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.AdminProviders.Commands.SuspendProviderApplication;

public class SuspendProviderApplicationCommandHandler : IRequestHandler<SuspendProviderApplicationCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public SuspendProviderApplicationCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(SuspendProviderApplicationCommand request, CancellationToken cancellationToken)
    {
        var profile = await _unitOfWork.TransportProviders.GetDetailByIdAsync(request.ProviderId, cancellationToken);
        if (profile == null) throw new KeyNotFoundException("Provider application not found.");

        profile.ApplicationStatus = ApplicationStatus.Suspended;
        profile.DriverStatus = DriverStatus.Offline;
        profile.AdminInternalNotes = $"[Suspended on {DateTime.UtcNow:yyyy-MM-dd HH:mm}]: {request.Reason}\n{profile.AdminInternalNotes}";

        _unitOfWork.TransportProviders.Update(profile);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
