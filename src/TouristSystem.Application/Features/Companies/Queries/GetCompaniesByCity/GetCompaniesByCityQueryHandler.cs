using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Companies.Queries.GetCompaniesByCity;

public class GetCompaniesByCityQueryHandler : IRequestHandler<GetCompaniesByCityQuery, List<CompanyDto>>
{
    private readonly IUnitOfWork _unitOfWork;

    public GetCompaniesByCityQueryHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<CompanyDto>> Handle(GetCompaniesByCityQuery request, CancellationToken cancellationToken)
    {
        var city = string.IsNullOrWhiteSpace(request.City) ? string.Empty : request.City.Trim();
        var companies = await _unitOfWork.TransportCompanies.GetByCityAsync(city, cancellationToken);

        return companies.Select(c => new CompanyDto
        {
            Id = c.Id,
            Name = c.Name,
            OperatingCities = !string.IsNullOrEmpty(c.OperatingCities)
                ? (JsonSerializer.Deserialize<List<string>>(c.OperatingCities) ?? new())
                : new(),
            IsSystemDefault = c.IsSystemDefault
        }).ToList();
    }
}
