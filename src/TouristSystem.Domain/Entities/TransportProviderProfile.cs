using System;
using System.Collections.Generic;
using TouristSystem.Domain.Common;
using TouristSystem.Domain.Enums;

namespace TouristSystem.Domain.Entities;

/// <summary>
/// Aggregate root representing an applicant or approved passenger transport provider.
/// </summary>
public class TransportProviderProfile : AuditableEntity
{
    public Guid UserId { get; set; }
    public Guid? CompanyId { get; set; }
    public string? CustomCompanyName { get; set; }
    public EmploymentType EmploymentType { get; set; } = EmploymentType.Driver;
    public int YearsWithCompany { get; set; }

    // Personal Information
    public string FullName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public int Age { get; set; }
    public string Gender { get; set; } = "Male";
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string Nationality { get; set; } = "Tajikistan";
    public string CurrentCity { get; set; } = string.Empty;
    public string CurrentAddress { get; set; } = string.Empty;
    public string? ProfilePhotoUrl { get; set; }

    // Driving Experience
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

    // Emergency Contact
    public string EmergencyContactName { get; set; } = string.Empty;
    public string EmergencyContactPhone { get; set; } = string.Empty;

    // Status & Metrics
    public ApplicationStatus ApplicationStatus { get; set; } = ApplicationStatus.Draft;
    public DriverStatus DriverStatus { get; set; } = DriverStatus.Offline;
    public decimal RatingAverage { get; set; } = 5.0m;
    public int CompletedTripsCount { get; set; } = 0;

    // Verification Checklist
    public bool IsIdentityVerified { get; set; } = false;
    public bool IsLicenseVerified { get; set; } = false;
    public bool IsVehicleVerified { get; set; } = false;
    public bool IsInsuranceVerified { get; set; } = false;
    public bool IsCompanyVerified { get; set; } = false;

    public string? RejectionReason { get; set; }
    public string? AdminInternalNotes { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public TransportCompany? Company { get; set; }
    public ProviderVehicle? Vehicle { get; set; }
    public ProviderService? Service { get; set; }
    public ICollection<ProviderWorkingHour> WorkingHours { get; set; } = new List<ProviderWorkingHour>();
    public ICollection<ProviderDocument> Documents { get; set; } = new List<ProviderDocument>();
}
