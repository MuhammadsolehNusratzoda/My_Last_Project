using System;
using System.Collections.Generic;
using MediatR;

namespace TouristSystem.Application.Features.Companies.Queries.GetCompaniesByCity;

public class CompanyDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<string> OperatingCities { get; set; } = new();
    public bool IsSystemDefault { get; set; }
}

public record GetCompaniesByCityQuery(string City) : IRequest<List<CompanyDto>>;
