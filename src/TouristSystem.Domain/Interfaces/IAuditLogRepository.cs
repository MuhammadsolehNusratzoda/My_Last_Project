using TouristSystem.Domain.Entities;

namespace TouristSystem.Domain.Interfaces;

/// <summary>
/// Defines specific contracts for AuditLog persistence operations.
/// </summary>
public interface IAuditLogRepository : IGenericRepository<AuditLog>
{
}
