using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TouristSystem.Application.Features.Guides.Commands.CreateGuide;
using TouristSystem.Application.Features.Guides.Commands.UpdateGuide;
using TouristSystem.Application.Features.Guides.Commands.DeleteGuide;
using TouristSystem.Application.Features.Guides.Queries.GetGuidesList;
using TouristSystem.Application.Features.Guides.Queries.GetGuideDetail;

namespace TouristSystem.WebApi.Controllers;

/// <summary>
/// API endpoints to query, create, update, and delete tour Guides.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class GuidesController : ControllerBase
{
    private readonly ISender _sender;

    public GuidesController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<IActionResult> GetList([FromQuery] GetGuidesListQuery query)
    {
        var response = await _sender.Send(query);
        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDetail(Guid id)
    {
        var response = await _sender.Send(new GetGuideDetailQuery(id));
        if (response == null)
        {
            return NotFound($"Guide profile with ID or User ID '{id}' was not found.");
        }
        return Ok(response);
    }

    [HttpPost]
    [Authorize(Roles = "Guide,Admin,SuperAdmin")]
    public async Task<IActionResult> Create([FromBody] CreateGuideCommand command)
    {
        var response = await _sender.Send(command);
        return CreatedAtAction(nameof(GetDetail), new { id = response }, response);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Guide,Admin,SuperAdmin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateOrUpdateGuideDto dto)
    {
        var command = new UpdateGuideCommand(
            id,
            dto.UserId,
            dto.Bio,
            dto.Languages,
            dto.City,
            dto.PricePerDay,
            dto.ExperienceYears,
            dto.ImageUrl,
            dto.IsAvailable,
            dto.Status);

        await _sender.Send(command);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Guide,Admin,SuperAdmin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _sender.Send(new DeleteGuideCommand(id));
        return NoContent();
    }
}

/// <summary>
/// Data contract for updating a Guide profile.
/// </summary>
public record CreateOrUpdateGuideDto(
    Guid UserId,
    string Bio,
    string Languages,
    string City,
    decimal PricePerDay,
    int ExperienceYears,
    string? ImageUrl,
    bool IsAvailable,
    string Status);
