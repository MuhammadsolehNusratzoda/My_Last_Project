namespace TouristSystem.Domain.Enums;

/// <summary>
/// Specifies the type of target entity for reviews (polymorphic relationship target).
/// </summary>
public enum ReviewType
{
    Place = 1,
    Hotel = 2,
    Restaurant = 3,
    Guide = 4
}
