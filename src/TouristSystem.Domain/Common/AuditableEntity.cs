using System;

namespace TouristSystem.Domain.Common;

/// <summary>
/// Abstract base class for entities requiring audit tracking (creation, modification, deletion) and soft delete support.
/// </summary>
public abstract class AuditableEntity : BaseEntity
{
    public DateTime CreatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedByUserId { get; set; }
    public bool IsDeleted { get; set; } = false;
}
