using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using TouristSystem.Application.Features.Companies.Queries.GetCompaniesByCity;

namespace TouristSystem.WebApi.Controllers;

/// <summary>
/// API endpoints for transport companies operating in Tajikistan cities.
/// </summary>
[ApiController]
[Route("api/transport-companies")]
public class TransportCompaniesController : ControllerBase
{
    private readonly ISender _sender;

    public TransportCompaniesController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<IActionResult> GetByCity([FromQuery] string? city)
    {
        var result = await _sender.Send(new GetCompaniesByCityQuery(city ?? string.Empty));
        return Ok(result);
    }
}
