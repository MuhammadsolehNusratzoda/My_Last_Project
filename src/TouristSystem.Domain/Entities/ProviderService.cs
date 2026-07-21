using System;
using TouristSystem.Domain.Common;

namespace TouristSystem.Domain.Entities;

/// <summary>
/// Service offerings, languages, operating cities, and payment methods configuration.
/// </summary>
public class ProviderService : AuditableEntity
{
    public Guid ProviderProfileId { get; set; }

    // JSON Arrays
    public string ServiceTypes { get; set; } = string.Empty; // e.g. ["Taxi","RideHailing","AirportTransfer"]
    public string AvailableCities { get; set; } = string.Empty; // e.g. ["Dushanbe","Khujand"]
    public string LanguagesSpoken { get; set; } = string.Empty; // e.g. ["Tajik","Russian","English"]
    public string PaymentMethods { get; set; } = string.Empty; // e.g. ["Cash","Card","Online"]

    // Navigation property
    public TransportProviderProfile ProviderProfile { get; set; } = null!;
}
