using System;
using System.Collections.Generic;

namespace TouristSystem.Application.Common.Models;

/// <summary>
/// A standardized wrapper for paginated collections returned by query handlers.
/// </summary>
/// <typeparam name="T">The result item type.</typeparam>
public class PagedList<T>
{
    public PagedList(IReadOnlyList<T> items, int count, int pageNumber, int pageSize)
    {
        Items = items;
        TotalCount = count;
        PageNumber = pageNumber;
        PageSize = pageSize;
        TotalPages = (int)Math.Ceiling(count / (double)pageSize);
    }

    public IReadOnlyList<T> Items { get; }
    public int PageNumber { get; }
    public int PageSize { get; }
    public int TotalCount { get; }
    public int TotalPages { get; }
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
}
