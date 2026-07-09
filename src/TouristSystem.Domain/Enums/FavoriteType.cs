namespace TouristSystem.Domain.Enums;

/// <summary>
/// Specifies the type of target entity for bookmarks (polymorphic relationship target).
/// </summary>
public enum FavoriteType
{
    Place = 1,
    Hotel = 2,
    Restaurant = 3,
    Guide = 4
}
