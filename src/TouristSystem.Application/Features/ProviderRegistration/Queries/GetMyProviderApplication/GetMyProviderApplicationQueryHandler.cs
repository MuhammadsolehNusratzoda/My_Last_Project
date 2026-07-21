using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Features.ProviderRegistration.DTOs;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.ProviderRegistration.Queries.GetMyProviderApplication;

public class GetMyProviderApplicationQueryHandler : IRequestHandler<GetMyProviderApplicationQuery, ProviderApplicationDossierDto?>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetMyProviderApplicationQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<ProviderApplicationDossierDto?> Handle(GetMyProviderApplicationQuery request, CancellationToken cancellationToken)
    {
        var profile = await _unitOfWork.TransportProviders.GetByUserIdAsync(request.UserId, cancellationToken);
        if (profile == null) return null;

        var isFullyVerified = profile.IsIdentityVerified &&
                              profile.IsLicenseVerified &&
                              profile.IsVehicleVerified &&
                              profile.IsInsuranceVerified &&
                              profile.IsCompanyVerified;

        var dto = new ProviderApplicationDossierDto
        {
            Id = profile.Id,
            UserId = profile.UserId,
            FullName = profile.FullName,
            DateOfBirth = profile.DateOfBirth,
            Age = profile.Age,
            Gender = profile.Gender,
            Phone = profile.Phone,
            Email = profile.Email,
            Nationality = profile.Nationality,
            CurrentCity = profile.CurrentCity,
            CurrentAddress = profile.CurrentAddress,
            ProfilePhotoUrl = profile.ProfilePhotoUrl,

            YearsDrivingExperience = profile.YearsDrivingExperience,
            IsProfessionalDriver = profile.IsProfessionalDriver,
            PreviousCompany = profile.PreviousCompany,

            LicenseNumber = profile.LicenseNumber,
            LicenseCategory = profile.LicenseCategory,
            LicenseIssueDate = profile.LicenseIssueDate,
            LicenseExpirationDate = profile.LicenseExpirationDate,
            LicenseFrontPhotoUrl = profile.LicenseFrontPhotoUrl,
            LicenseBackPhotoUrl = profile.LicenseBackPhotoUrl,

            CompanyId = profile.CompanyId,
            CompanyName = profile.Company?.Name,
            CustomCompanyName = profile.CustomCompanyName,
            EmploymentType = profile.EmploymentType.ToString(),
            YearsWithCompany = profile.YearsWithCompany,

            EmergencyContactName = profile.EmergencyContactName,
            EmergencyContactPhone = profile.EmergencyContactPhone,

            ApplicationStatus = profile.ApplicationStatus.ToString(),
            DriverStatus = profile.DriverStatus.ToString(),
            RatingAverage = profile.RatingAverage,
            CompletedTripsCount = profile.CompletedTripsCount,

            IsIdentityVerified = profile.IsIdentityVerified,
            IsLicenseVerified = profile.IsLicenseVerified,
            IsVehicleVerified = profile.IsVehicleVerified,
            IsInsuranceVerified = profile.IsInsuranceVerified,
            IsCompanyVerified = profile.IsCompanyVerified,
            IsFullyVerified = isFullyVerified,

            RejectionReason = profile.RejectionReason,
            AdminInternalNotes = profile.AdminInternalNotes,
            SubmittedAt = profile.SubmittedAt,
            ReviewedAt = profile.ReviewedAt,
            CreatedAt = profile.CreatedAt
        };

        if (profile.Vehicle != null)
        {
            dto.Vehicle = new VehicleInfoDto
            {
                RegistrationNumber = profile.Vehicle.RegistrationNumber,
                Brand = profile.Vehicle.Brand,
                Model = profile.Vehicle.Model,
                ManufacturingYear = profile.Vehicle.ManufacturingYear,
                Color = profile.Vehicle.Color,
                PassengerSeats = profile.Vehicle.PassengerSeats,

                HasAirConditioning = profile.Vehicle.HasAirConditioning,
                HasWifi = profile.Vehicle.HasWifi,
                HasLuggageSpace = profile.Vehicle.HasLuggageSpace,
                ChildSeatAvailable = profile.Vehicle.ChildSeatAvailable,
                WheelchairAccessible = profile.Vehicle.WheelchairAccessible,
                PetFriendly = profile.Vehicle.PetFriendly,
                SmokingAllowed = profile.Vehicle.SmokingAllowed,

                RegistrationCertificateUrl = profile.Vehicle.RegistrationCertificateUrl,
                InsuranceCertificateUrl = profile.Vehicle.InsuranceCertificateUrl,
                TechnicalInspectionCertificateUrl = profile.Vehicle.TechnicalInspectionCertificateUrl,
                VehiclePhotos = profile.Vehicle.Photos.OrderBy(p => p.DisplayOrder).Select(p => p.PhotoUrl).ToList()
            };
        }

        if (profile.Service != null)
        {
            dto.Service = new ServiceInfoDto
            {
                ServiceTypes = JsonSerializer.Deserialize<List<string>>(profile.Service.ServiceTypes) ?? new(),
                AvailableCities = JsonSerializer.Deserialize<List<string>>(profile.Service.AvailableCities) ?? new(),
                LanguagesSpoken = JsonSerializer.Deserialize<List<string>>(profile.Service.LanguagesSpoken) ?? new(),
                PaymentMethods = JsonSerializer.Deserialize<List<string>>(profile.Service.PaymentMethods) ?? new()
            };
        }

        dto.WorkingHours = profile.WorkingHours.Select(w => new WorkingHourDto
        {
            DayOfWeek = w.DayOfWeek,
            StartTime = w.StartTime.ToString(@"hh\:mm"),
            EndTime = w.EndTime.ToString(@"hh\:mm"),
            Is24Hours = w.Is24Hours
        }).ToList();

        return dto;
    }
}
