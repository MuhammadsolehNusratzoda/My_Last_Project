using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace TouristSystem.Domain.Interfaces;

/// <summary>
/// Declares generic read and write persistence contracts for domain entities.
/// </summary>
/// <typeparam name="T">The entity type.</typeparam>
public interface IGenericRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default);
    Task AddAsync(T entity, CancellationToken cancellationToken = default);
    void Update(T entity);
    void Delete(T entity);
}
