namespace TouristSystem.Domain.Enums;

/// <summary>
/// Specifies the lifecycle and moderation state of a passenger transport provider application.
/// </summary>
public enum ApplicationStatus
{
    Draft = 1,
    PendingReview = 2,
    Approved = 3,
    Rejected = 4,
    Suspended = 5
}
