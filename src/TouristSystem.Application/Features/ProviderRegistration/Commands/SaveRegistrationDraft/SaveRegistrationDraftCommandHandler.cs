using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Features.ProviderRegistration.DTOs;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.ProviderRegistration.Commands.SaveRegistrationDraft;

public class SaveRegistrationDraftCommandHandler : IRequestHandler<SaveRegistrationDraftCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;

    public SaveRegistrationDraftCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(SaveRegistrationDraftCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Data;

        // Calculate age
        var today = DateTime.UtcNow.Date;
        var age = today.Year - dto.DateOfBirth.Year;
        if (dto.DateOfBirth.Date > today.AddYears(-age)) age--;

        var profile = await _unitOfWork.TransportProviders.GetByUserIdAsync(request.UserId, cancellationToken);

        if (profile == null)
        {
            profile = new TransportProviderProfile
            {
                UserId = request.UserId,
                ApplicationStatus = ApplicationStatus.Draft,
                DriverStatus = DriverStatus.Offline,
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.TransportProviders.AddAsync(profile, cancellationToken);
        }

        // Map personal details
        profile.FullName = dto.FullName;
        profile.DateOfBirth = dto.DateOfBirth;
        profile.Age = age;
        profile.Gender = string.IsNullOrEmpty(dto.Gender) ? "Male" : dto.Gender;
        profile.Phone = dto.Phone;
        profile.Email = dto.Email;
        profile.Nationality = string.IsNullOrEmpty(dto.Nationality) ? "Tajikistan" : dto.Nationality;
        profile.CurrentCity = dto.CurrentCity;
        profile.CurrentAddress = dto.CurrentAddress;
        profile.ProfilePhotoUrl = dto.ProfilePhotoUrl;

        // Driving experience
        profile.YearsDrivingExperience = dto.YearsDrivingExperience;
        profile.IsProfessionalDriver = dto.IsProfessionalDriver;
        profile.PreviousCompany = dto.PreviousCompany;

        // License
        profile.LicenseNumber = dto.LicenseNumber;
        profile.LicenseCategory = dto.LicenseCategory;
        profile.LicenseIssueDate = dto.LicenseIssueDate;
        profile.LicenseExpirationDate = dto.LicenseExpirationDate;
        profile.LicenseFrontPhotoUrl = dto.LicenseFrontPhotoUrl;
        profile.LicenseBackPhotoUrl = dto.LicenseBackPhotoUrl;

        // Company & Employment
        profile.CompanyId = dto.CompanyId;
        profile.CustomCompanyName = dto.CustomCompanyName;
        if (Enum.TryParse<EmploymentType>(dto.EmploymentType, true, out var empType))
        {
            profile.EmploymentType = empType;
        }
        profile.YearsWithCompany = dto.YearsWithCompany;

        // Emergency Contact
        profile.EmergencyContactName = dto.EmergencyContactName;
        profile.EmergencyContactPhone = dto.EmergencyContactPhone;

        // Vehicle mapping
        if (dto.Vehicle != null)
        {
            if (profile.Vehicle == null)
            {
                profile.Vehicle = new ProviderVehicle
                {
                    ProviderProfileId = profile.Id,
                    CreatedAt = DateTime.UtcNow
                };
            }

            profile.Vehicle.RegistrationNumber = dto.Vehicle.RegistrationNumber;
            profile.Vehicle.Brand = dto.Vehicle.Brand;
            profile.Vehicle.Model = dto.Vehicle.Model;
            profile.Vehicle.ManufacturingYear = dto.Vehicle.ManufacturingYear;
            profile.Vehicle.Color = dto.Vehicle.Color;
            profile.Vehicle.PassengerSeats = dto.Vehicle.PassengerSeats;

            profile.Vehicle.HasAirConditioning = dto.Vehicle.HasAirConditioning;
            profile.Vehicle.HasWifi = dto.Vehicle.HasWifi;
            profile.Vehicle.HasLuggageSpace = dto.Vehicle.HasLuggageSpace;
            profile.Vehicle.ChildSeatAvailable = dto.Vehicle.ChildSeatAvailable;
            profile.Vehicle.WheelchairAccessible = dto.Vehicle.WheelchairAccessible;
            profile.Vehicle.PetFriendly = dto.Vehicle.PetFriendly;
            profile.Vehicle.SmokingAllowed = dto.Vehicle.SmokingAllowed;

            profile.Vehicle.RegistrationCertificateUrl = dto.Vehicle.RegistrationCertificateUrl;
            profile.Vehicle.InsuranceCertificateUrl = dto.Vehicle.InsuranceCertificateUrl;
            profile.Vehicle.TechnicalInspectionCertificateUrl = dto.Vehicle.TechnicalInspectionCertificateUrl;

            // Vehicle Photos
            profile.Vehicle.Photos.Clear();
            int order = 0;
            foreach (var url in dto.Vehicle.VehiclePhotos)
            {
                profile.Vehicle.Photos.Add(new VehiclePhoto
                {
                    VehicleId = profile.Vehicle.Id,
                    PhotoUrl = url,
                    IsPrimary = order == 0,
                    DisplayOrder = order++,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        // Service mapping
        if (dto.Service != null)
        {
            if (profile.Service == null)
            {
                profile.Service = new ProviderService
                {
                    ProviderProfileId = profile.Id,
                    CreatedAt = DateTime.UtcNow
                };
            }

            profile.Service.ServiceTypes = JsonSerializer.Serialize(dto.Service.ServiceTypes);
            profile.Service.AvailableCities = JsonSerializer.Serialize(dto.Service.AvailableCities);
            profile.Service.LanguagesSpoken = JsonSerializer.Serialize(dto.Service.LanguagesSpoken);
            profile.Service.PaymentMethods = JsonSerializer.Serialize(dto.Service.PaymentMethods);
        }

        // Working Hours mapping
        profile.WorkingHours.Clear();
        foreach (var wh in dto.WorkingHours)
        {
            TimeSpan start = TimeSpan.TryParse(wh.StartTime, out var s) ? s : new TimeSpan(8, 0, 0);
            TimeSpan end = TimeSpan.TryParse(wh.EndTime, out var e) ? e : new TimeSpan(20, 0, 0);

            profile.WorkingHours.Add(new ProviderWorkingHour
            {
                ProviderProfileId = profile.Id,
                DayOfWeek = wh.DayOfWeek,
                StartTime = start,
                EndTime = end,
                Is24Hours = wh.Is24Hours,
                CreatedAt = DateTime.UtcNow
            });
        }

        _unitOfWork.TransportProviders.Update(profile);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return profile.Id;
    }
}
