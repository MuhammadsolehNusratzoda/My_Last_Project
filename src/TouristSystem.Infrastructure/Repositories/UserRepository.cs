using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Interfaces;
using TouristSystem.Infrastructure.Data;

namespace TouristSystem.Infrastructure.Repositories;

/// <summary>
/// User-specific repository implementation using Entity Framework Core.
/// </summary>
public class UserRepository : GenericRepository<User>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower(), cancellationToken);
    }

    public async Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AnyAsync(u => u.Email.ToLower() == email.ToLower(), cancellationToken);
    }
}
