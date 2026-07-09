using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TouristSystem.Application.Features.Restaurants.Commands.CreateRestaurant;
using TouristSystem.Application.Features.Restaurants.Commands.UpdateRestaurant;
using TouristSystem.Application.Features.Restaurants.Commands.DeleteRestaurant;
using TouristSystem.Application.Features.Restaurants.Queries.GetRestaurantsList;
using TouristSystem.Application.Features.Restaurants.Queries.GetRestaurantDetail;

namespace TouristSystem.WebApi.Controllers;

/// <summary>
/// API endpoints to query, create, update, and delete dining Restaurants.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class RestaurantsController : ControllerBase
{
    private readonly ISender _sender;

    public RestaurantsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<IActionResult> GetList([FromQuery] GetRestaurantsListQuery query)
    {
        var response = await _sender.Send(query);
        return Ok(response);
    }

    [HttpGet("{idOrSlug}")]
    public async Task<IActionResult> GetDetail(string idOrSlug)
    {
        var response = await _sender.Send(new GetRestaurantDetailQuery(idOrSlug));
        if (response == null)
        {
            return NotFound($"Restaurant listing with ID or Slug '{idOrSlug}' was not found.");
        }
        return Ok(response);
    }

    [HttpPost]
    [Authorize(Roles = "RestaurantOwner,Admin,SuperAdmin")]
    public async Task<IActionResult> Create([FromBody] CreateRestaurantCommand command)
    {
        var response = await _sender.Send(command);
        return CreatedAtAction(nameof(GetDetail), new { idOrSlug = response }, response);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "RestaurantOwner,Admin,SuperAdmin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateOrUpdateRestaurantDto dto)
    {
        var command = new UpdateRestaurantCommand(
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
            dto.CuisineType,
            dto.PriceRange,
            dto.OpeningHours,
            dto.HasDelivery,
            dto.HasWifi,
            dto.HasParking,
            dto.Status);

        await _sender.Send(command);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "RestaurantOwner,Admin,SuperAdmin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _sender.Send(new DeleteRestaurantCommand(id));
        return NoContent();
    }
}

/// <summary>
/// Data contract for updating a Restaurant.
/// </summary>
public record CreateOrUpdateRestaurantDto(
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
    string CuisineType,
    string PriceRange,
    string OpeningHours,
    bool HasDelivery,
    bool HasWifi,
    bool HasParking,
    string Status);
