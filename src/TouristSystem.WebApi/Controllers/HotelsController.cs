using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TouristSystem.Application.Features.Hotels.Commands.CreateHotel;
using TouristSystem.Application.Features.Hotels.Commands.UpdateHotel;
using TouristSystem.Application.Features.Hotels.Commands.DeleteHotel;
using TouristSystem.Application.Features.Hotels.Queries.GetHotelsList;
using TouristSystem.Application.Features.Hotels.Queries.GetHotelDetail;

namespace TouristSystem.WebApi.Controllers;

/// <summary>
/// API endpoints to query, create, update, and delete lodging Hotels.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class HotelsController : ControllerBase
{
    private readonly ISender _sender;

    public HotelsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<IActionResult> GetList([FromQuery] GetHotelsListQuery query)
    {
        var response = await _sender.Send(query);
        return Ok(response);
    }

    [HttpGet("{idOrSlug}")]
    public async Task<IActionResult> GetDetail(string idOrSlug)
    {
        var response = await _sender.Send(new GetHotelDetailQuery(idOrSlug));
        if (response == null)
        {
            return NotFound($"Hotel listing with ID or Slug '{idOrSlug}' was not found.");
        }
        return Ok(response);
    }

    [HttpPost]
    [Authorize(Roles = "HotelOwner,Admin,SuperAdmin")]
    public async Task<IActionResult> Create([FromBody] CreateHotelCommand command)
    {
        var response = await _sender.Send(command);
        return CreatedAtAction(nameof(GetDetail), new { idOrSlug = response }, response);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "HotelOwner,Admin,SuperAdmin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateOrUpdateHotelDto dto)
    {
        var command = new UpdateHotelCommand(
            id,
            dto.OwnerId,
            dto.Name,
            dto.Description,
            dto.City,
            dto.Address,
            dto.Latitude,
            dto.Longitude,
            dto.PhoneNumber,
            dto.WebsiteUrl,
            dto.ImageUrl,
            dto.PricePerNight,
            dto.Stars,
            dto.TotalRooms,
            dto.AvailableRooms,
            dto.HasWifi,
            dto.HasParking,
            dto.HasPool,
            dto.HasGym,
            dto.HasRestaurant,
            dto.IsFamilyFriendly,
            dto.IsLuxury,
            dto.IsBudget,
            dto.Status);

        await _sender.Send(command);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "HotelOwner,Admin,SuperAdmin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _sender.Send(new DeleteHotelCommand(id));
        return NoContent();
    }
}

/// <summary>
/// Data contract for updating a Hotel.
/// </summary>
public record CreateOrUpdateHotelDto(
    Guid OwnerId,
    string Name,
    string Description,
    string City,
    string Address,
    decimal? Latitude,
    decimal? Longitude,
    string PhoneNumber,
    string? WebsiteUrl,
    string? ImageUrl,
    decimal PricePerNight,
    int Stars,
    int TotalRooms,
    int AvailableRooms,
    bool HasWifi,
    bool HasParking,
    bool HasPool,
    bool HasGym,
    bool HasRestaurant,
    bool IsFamilyFriendly,
    bool IsLuxury,
    bool IsBudget,
    string Status);
