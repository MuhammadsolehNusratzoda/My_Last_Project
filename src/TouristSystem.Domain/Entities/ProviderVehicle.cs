using System;
using System.Collections.Generic;
using TouristSystem.Domain.Common;

namespace TouristSystem.Domain.Entities;

/// <summary>
/// Vehicle details attached to a passenger transport provider profile.
/// </summary>
public class ProviderVehicle : AuditableEntity
{
    public Guid ProviderProfileId { get; set; }
    public string RegistrationNumber { get; set; } = string.Empty; // e.g. 5679AN08
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int ManufacturingYear { get; set; }
    public string Color { get; set; } = string.Empty;
    public int PassengerSeats { get; set; } = 4;

    // Feature Flags
    public bool HasAirConditioning { get; set; } = true;
    public bool HasWifi { get; set; } = false;
    public bool HasLuggageSpace { get; set; } = true;
    public bool ChildSeatAvailable { get; set; } = false;
    public bool WheelchairAccessible { get; set; } = false;
    public bool PetFriendly { get; set; } = false;
    public bool SmokingAllowed { get; set; } = false;

    // Document Upload URLs
    public string RegistrationCertificateUrl { get; set; } = string.Empty;
    public string InsuranceCertificateUrl { get; set; } = string.Empty;
    public string? TechnicalInspectionCertificateUrl { get; set; }

    // Navigation properties
    public TransportProviderProfile ProviderProfile { get; set; } = null!;
    public ICollection<VehiclePhoto> Photos { get; set; } = new List<VehiclePhoto>();
}
