using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Features.ProviderRegistration.Commands.SaveRegistrationDraft;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.ProviderRegistration.Commands.SubmitRegistrationApplication;

public class SubmitRegistrationApplicationCommandHandler : IRequestHandler<SubmitRegistrationApplicationCommand, Guid>
{
    private readonly ISender _sender;
    private readonly IUnitOfWork _unitOfWork;

    public SubmitRegistrationApplicationCommandHandler(ISender sender, IUnitOfWork unitOfWork)
    {
        _sender = sender;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(SubmitRegistrationApplicationCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Data;

        // 1. Save latest state to draft first
        var profileId = await _sender.Send(new SaveRegistrationDraftCommand(request.UserId, dto), cancellationToken);

        var profile = await _unitOfWork.TransportProviders.GetDetailByIdAsync(profileId, cancellationToken);
        if (profile == null) throw new InvalidOperationException("Failed to locate provider profile.");

        // 2. Validate Personal Info
        if (string.IsNullOrWhiteSpace(profile.FullName) || profile.FullName.Trim().Length < 3 || profile.FullName.Trim().Length > 100)
            throw new ArgumentException("Full Name is required and must be between 3 and 100 characters.");

        if (profile.Age < 20)
            throw new ArgumentException($"Driver must be at least 20 years old. Current age calculated: {profile.Age} years.");

        if (string.IsNullOrWhiteSpace(profile.Phone))
            throw new ArgumentException("Phone Number is required.");

        if (await _unitOfWork.TransportProviders.PhoneExistsAsync(profile.Phone, request.UserId, cancellationToken))
            throw new ArgumentException($"Phone number '{profile.Phone}' is already registered by another driver.");

        // 3. Validate Driving Experience & License
        if (profile.YearsDrivingExperience < 1 || profile.YearsDrivingExperience > 60)
            throw new ArgumentException("Years of Driving Experience must be between 1 and 60.");

        if (string.IsNullOrWhiteSpace(profile.LicenseNumber))
            throw new ArgumentException("Driver License Number is mandatory.");

        if (await _unitOfWork.TransportProviders.LicenseNumberExistsAsync(profile.LicenseNumber, request.UserId, cancellationToken))
            throw new ArgumentException($"License Number '{profile.LicenseNumber}' is already registered in the system.");

        if (profile.LicenseExpirationDate <= DateTime.UtcNow.Date)
            throw new ArgumentException($"Driver License expired on {profile.LicenseExpirationDate:yyyy-MM-dd}. Registration cannot continue with an expired license.");

        if (string.IsNullOrWhiteSpace(profile.LicenseFrontPhotoUrl))
            throw new ArgumentException("Front photo of Driver License is required.");

        // 4. Validate Vehicle Information
        var vehicle = profile.Vehicle;
        if (vehicle == null)
            throw new ArgumentException("Vehicle Information is required.");

        if (string.IsNullOrWhiteSpace(vehicle.RegistrationNumber))
            throw new ArgumentException("Vehicle Registration Number is required.");

        if (await _unitOfWork.TransportProviders.VehicleRegExistsAsync(vehicle.RegistrationNumber, vehicle.Id, cancellationToken))
            throw new ArgumentException($"Vehicle Registration Number '{vehicle.RegistrationNumber}' is already registered.");

        if (vehicle.Photos.Count < 3 || vehicle.Photos.Count > 10)
            throw new ArgumentException($"Between 3 and 10 vehicle photos are required. Currently uploaded: {vehicle.Photos.Count} photos.");

        if (string.IsNullOrWhiteSpace(vehicle.RegistrationCertificateUrl))
            throw new ArgumentException("Vehicle Registration Certificate is required.");

        if (string.IsNullOrWhiteSpace(vehicle.InsuranceCertificateUrl))
            throw new ArgumentException("Vehicle Insurance Certificate is required.");

        // 5. Transition State to PendingReview
        profile.ApplicationStatus = ApplicationStatus.PendingReview;
        profile.SubmittedAt = DateTime.UtcNow;

        _unitOfWork.TransportProviders.Update(profile);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return profile.Id;
    }
}
