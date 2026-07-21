using System;
using System.Collections.Generic;

namespace TouristSystem.Application.Features.ProviderRegistration.DTOs;

public class SaveProviderDraftDto
{
    // Personal Info
    public string FullName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = "Male";
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string Nationality { get; set; } = "Tajikistan";
    public string CurrentCity { get; set; } = string.Empty;
    public string CurrentAddress { get; set; } = string.Empty;
    public string? ProfilePhotoUrl { get; set; }

    // Experience
    public int YearsDrivingExperience { get; set; } = 1;
    public bool IsProfessionalDriver { get; set; } = true;
    public string? PreviousCompany { get; set; }

    // Driver License
    public string LicenseNumber { get; set; } = string.Empty;
    public string LicenseCategory { get; set; } = "B";
    public DateTime LicenseIssueDate { get; set; }
    public DateTime LicenseExpirationDate { get; set; }
    public string? LicenseFrontPhotoUrl { get; set; }
    public string? LicenseBackPhotoUrl { get; set; }

    // Transport Company
    public Guid? CompanyId { get; set; }
    public string? CustomCompanyName { get; set; }
    public string EmploymentType { get; set; } = "Driver";
    public int YearsWithCompany { get; set; } = 1;

    // Vehicle Info
    public VehicleInfoDto? Vehicle { get; set; }

    // Service Info
    public ServiceInfoDto? Service { get; set; }

    // Working Hours
    public List<WorkingHourDto> WorkingHours { get; set; } = new();

    // Emergency Contact
    public string EmergencyContactName { get; set; } = string.Empty;
    public string EmergencyContactPhone { get; set; } = string.Empty;
}

public class VehicleInfoDto
{
    public string RegistrationNumber { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int ManufacturingYear { get; set; }
    public string Color { get; set; } = string.Empty;
    public int PassengerSeats { get; set; } = 4;

    public bool HasAirConditioning { get; set; } = true;
    public bool HasWifi { get; set; } = false;
    public bool HasLuggageSpace { get; set; } = true;
    public bool ChildSeatAvailable { get; set; } = false;
    public bool WheelchairAccessible { get; set; } = false;
    public bool PetFriendly { get; set; } = false;
    public bool SmokingAllowed { get; set; } = false;

    public string RegistrationCertificateUrl { get; set; } = string.Empty;
    public string InsuranceCertificateUrl { get; set; } = string.Empty;
    public string? TechnicalInspectionCertificateUrl { get; set; }

    public List<string> VehiclePhotos { get; set; } = new();
}

public class ServiceInfoDto
{
    public List<string> ServiceTypes { get; set; } = new();
    public List<string> AvailableCities { get; set; } = new();
    public List<string> LanguagesSpoken { get; set; } = new();
    public List<string> PaymentMethods { get; set; } = new();
}

public class WorkingHourDto
{
    public string DayOfWeek { get; set; } = "Monday";
    public string StartTime { get; set; } = "08:00";
    public string EndTime { get; set; } = "20:00";
    public bool Is24Hours { get; set; } = false;
}

public class ProviderApplicationDossierDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public int Age { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string Nationality { get; set; } = string.Empty;
    public string CurrentCity { get; set; } = string.Empty;
    public string CurrentAddress { get; set; } = string.Empty;
    public string? ProfilePhotoUrl { get; set; }

    public int YearsDrivingExperience { get; set; }
    public bool IsProfessionalDriver { get; set; }
    public string? PreviousCompany { get; set; }

    public string LicenseNumber { get; set; } = string.Empty;
    public string LicenseCategory { get; set; } = string.Empty;
    public DateTime LicenseIssueDate { get; set; }
    public DateTime LicenseExpirationDate { get; set; }
    public string? LicenseFrontPhotoUrl { get; set; }
    public string? LicenseBackPhotoUrl { get; set; }

    public Guid? CompanyId { get; set; }
    public string? CompanyName { get; set; }
    public string? CustomCompanyName { get; set; }
    public string EmploymentType { get; set; } = string.Empty;
    public int YearsWithCompany { get; set; }

    public VehicleInfoDto? Vehicle { get; set; }
    public ServiceInfoDto? Service { get; set; }
    public List<WorkingHourDto> WorkingHours { get; set; } = new();

    public string EmergencyContactName { get; set; } = string.Empty;
    public string EmergencyContactPhone { get; set; } = string.Empty;

    public string ApplicationStatus { get; set; } = string.Empty;
    public string DriverStatus { get; set; } = string.Empty;
    public decimal RatingAverage { get; set; }
    public int CompletedTripsCount { get; set; }

    public bool IsIdentityVerified { get; set; }
    public bool IsLicenseVerified { get; set; }
    public bool IsVehicleVerified { get; set; }
    public bool IsInsuranceVerified { get; set; }
    public bool IsCompanyVerified { get; set; }
    public bool IsFullyVerified { get; set; }

    public string? RejectionReason { get; set; }
    public string? AdminInternalNotes { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
