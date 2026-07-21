using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TouristSystem.Domain.Entities;

namespace TouristSystem.Domain.Interfaces;

/// <summary>
/// Persistence contracts for TransportCompany queries.
/// </summary>
public interface ITransportCompanyRepository : IGenericRepository<TransportCompany>
{
    Task<IReadOnlyList<TransportCompany>> GetByCityAsync(string city, CancellationToken cancellationToken = default);
    Task<TransportCompany?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
}
