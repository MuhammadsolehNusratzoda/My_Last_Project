using System;
using System.Collections.Generic;
using MediatR;
using TouristSystem.Application.Common.Models;

namespace TouristSystem.Application.Features.AdminProviders.Queries.GetAdminProviderApplicationsList;

public class AdminProviderApplicationSummaryDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string CurrentCity { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string VehicleInfo { get; set; } = string.Empty;
    public string VehicleRegNumber { get; set; } = string.Empty;
    public int YearsDrivingExperience { get; set; }
    public string ApplicationStatus { get; set; } = string.Empty;
    public string DriverStatus { get; set; } = string.Empty;
    public decimal RatingAverage { get; set; }
    public bool IsFullyVerified { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class GetAdminProviderApplicationsListQuery : IRequest<PagedList<AdminProviderApplicationSummaryDto>>
{
    public string? Status { get; set; }
    public string? Company { get; set; }
    public string? City { get; set; }
    public string? Search { get; set; }
    public bool? IsVerifiedOnly { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
