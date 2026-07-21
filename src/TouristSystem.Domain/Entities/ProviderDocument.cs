using System;
using TouristSystem.Domain.Common;

namespace TouristSystem.Domain.Entities;

/// <summary>
/// Generic document metadata container for identity, driver license, vehicle registration, and insurance.
/// </summary>
public class ProviderDocument : AuditableEntity
{
    public Guid ProviderProfileId { get; set; }
    public string DocumentType { get; set; } = string.Empty; // Identity, LicenseFront, LicenseBack, VehicleRegistration, Insurance, Inspection
    public string FileUrl { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string FileExtension { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string MimeType { get; set; } = string.Empty;
    public bool IsVerified { get; set; } = false;

    // Navigation property
    public TransportProviderProfile ProviderProfile { get; set; } = null!;
}
