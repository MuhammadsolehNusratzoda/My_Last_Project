using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using TouristSystem.Application.Features.Map.GetMapDestinations;

namespace TouristSystem.WebApi.Controllers;

/// <summary>
/// Provides map destination data for the interactive navigation UI.
/// Public endpoint — no authentication required.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class MapController : ControllerBase
{
    private readonly ISender _sender;

    public MapController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>
    /// Returns all places, hotels, and restaurants that have GPS coordinates.
    /// Used by the frontend to populate destination markers on the map.
    /// </summary>
    [HttpGet("destinations")]
    public async Task<IActionResult> GetDestinations()
    {
        var destinations = await _sender.Send(new GetMapDestinationsQuery());
        return Ok(destinations);
    }
}
