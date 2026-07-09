using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TouristSystem.Application.Features.Places.Commands.CreatePlace;
using TouristSystem.Application.Features.Places.Commands.UpdatePlace;
using TouristSystem.Application.Features.Places.Commands.DeletePlace;
using TouristSystem.Application.Features.Places.Queries.GetPlacesList;
using TouristSystem.Application.Features.Places.Queries.GetPlaceDetail;

namespace TouristSystem.WebApi.Controllers;

/// <summary>
/// API endpoints to query, create, update, and delete tourist Places.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class PlacesController : ControllerBase
{
    private readonly ISender _sender;

    public PlacesController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<IActionResult> GetList([FromQuery] GetPlacesListQuery query)
    {
        var response = await _sender.Send(query);
        return Ok(response);
    }

    [HttpGet("{idOrSlug}")]
    public async Task<IActionResult> GetDetail(string idOrSlug)
    {
        var response = await _sender.Send(new GetPlaceDetailQuery(idOrSlug));
        if (response == null)
        {
            return NotFound($"Attraction with ID or Slug '{idOrSlug}' was not found.");
        }
        return Ok(response);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Create([FromBody] CreatePlaceCommand command)
    {
        var response = await _sender.Send(command);
        return CreatedAtAction(nameof(GetDetail), new { idOrSlug = response }, response);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateOrUpdatePlaceDto dto)
    {
        var command = new UpdatePlaceCommand(
            id,
            dto.Name,
            dto.Description,
            dto.City,
            dto.Address,
            dto.Latitude,
            dto.Longitude,
            dto.ImageUrl,
            dto.EntryFee,
            dto.Status);

        await _sender.Send(command);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _sender.Send(new DeletePlaceCommand(id));
        return NoContent();
    }
}

/// <summary>
/// Data contract for updating a tourist Place.
/// </summary>
public record CreateOrUpdatePlaceDto(
    string Name,
    string Description,
    string City,
    string? Address,
    decimal? Latitude,
    decimal? Longitude,
    string? ImageUrl,
    decimal EntryFee,
    string Status);
