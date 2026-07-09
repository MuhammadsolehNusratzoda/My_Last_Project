using System.Threading;
using System.Threading.Tasks;
using TouristSystem.Domain.Entities;

namespace TouristSystem.Domain.Interfaces;

/// <summary>
/// Defines specific contracts for User persistence queries.
/// </summary>
public interface IUserRepository : IGenericRepository<User>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default);
}
