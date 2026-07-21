using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Common.Models;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.AdminProviders.Queries.GetAdminProviderApplicationsList;

public class GetAdminProviderApplicationsListQueryHandler : IRequestHandler<GetAdminProviderApplicationsListQuery, PagedList<AdminProviderApplicationSummaryDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetAdminProviderApplicationsListQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedList<AdminProviderApplicationSummaryDto>> Handle(GetAdminProviderApplicationsListQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await _unitOfWork.TransportProviders.GetAdminPagedAsync(
            request.Status,
            request.Company,
            request.City,
            request.Search,
            request.IsVerifiedOnly,
            request.Page,
            request.PageSize,
            cancellationToken);

        var dtos = items.Select(p => new AdminProviderApplicationSummaryDto
        {
            Id = p.Id,
            UserId = p.UserId,
            FullName = p.FullName,
            Phone = p.Phone,
            CurrentCity = p.CurrentCity,
            CompanyName = p.Company != null ? p.Company.Name : (p.CustomCompanyName ?? "Independent"),
            VehicleInfo = p.Vehicle != null ? $"{p.Vehicle.Brand} {p.Vehicle.Model} ({p.Vehicle.ManufacturingYear})" : "No Vehicle",
            VehicleRegNumber = p.Vehicle != null ? p.Vehicle.RegistrationNumber : string.Empty,
            YearsDrivingExperience = p.YearsDrivingExperience,
            ApplicationStatus = p.ApplicationStatus.ToString(),
            DriverStatus = p.DriverStatus.ToString(),
            RatingAverage = p.RatingAverage,
            IsFullyVerified = p.IsIdentityVerified && p.IsLicenseVerified && p.IsVehicleVerified && p.IsInsuranceVerified && p.IsCompanyVerified,
            SubmittedAt = p.SubmittedAt,
            CreatedAt = p.CreatedAt
        }).ToList();

        return new PagedList<AdminProviderApplicationSummaryDto>(dtos, totalCount, request.Page, request.PageSize);
    }
}
