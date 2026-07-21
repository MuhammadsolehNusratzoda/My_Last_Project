using System;
using System.Collections.Generic;
using TouristSystem.Domain.Common;

namespace TouristSystem.Domain.Entities;

/// <summary>
/// Represents a passenger transport company operating in Tajikistan (e.g. JURA, Maxim, Olucha Taxi, Somon Taxi).
/// </summary>
public class TransportCompany : AuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string OperatingCities { get; set; } = string.Empty; // Serialized JSON array e.g. ["Dushanbe","Khujand"]
    public bool IsApproved { get; set; } = true;
    public bool IsSystemDefault { get; set; } = false;

    // Navigation properties
    public ICollection<TransportProviderProfile> Providers { get; set; } = new List<TransportProviderProfile>();
}
