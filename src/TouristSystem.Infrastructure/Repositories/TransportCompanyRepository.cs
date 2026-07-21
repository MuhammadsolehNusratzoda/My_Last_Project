using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Interfaces;
using TouristSystem.Infrastructure.Data;

namespace TouristSystem.Infrastructure.Repositories;

public class TransportCompanyRepository : GenericRepository<TransportCompany>, ITransportCompanyRepository
{
    public TransportCompanyRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IReadOnlyList<TransportCompany>> GetByCityAsync(string city, CancellationToken cancellationToken = default)
    {
        var cityLower = city.Trim().ToLower();
        var allCompanies = await DbSet.Where(c => c.IsApproved).ToListAsync(cancellationToken);
        
        return allCompanies
            .Where(c => string.IsNullOrEmpty(c.OperatingCities) || 
                       c.OperatingCities.ToLower().Contains(cityLower) ||
                       c.OperatingCities.Contains("*"))
            .ToList();
    }

    public async Task<TransportCompany?> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        return await DbSet.FirstOrDefaultAsync(c => c.Name.ToLower() == name.Trim().ToLower(), cancellationToken);
    }
}
