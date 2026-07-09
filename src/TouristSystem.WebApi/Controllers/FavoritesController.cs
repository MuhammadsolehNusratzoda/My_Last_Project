using System;
using System.Security.Claims;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TouristSystem.Application.Features.Favorites.Commands.CreateFavorite;
using TouristSystem.Application.Features.Favorites.Commands.DeleteFavorite;
using TouristSystem.Application.Features.Favorites.Queries.GetFavoritesList;

namespace TouristSystem.WebApi.Controllers;

/// <summary>
/// API endpoints to query, create, and delete bookmarked listing Favorites.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly ISender _sender;

    public FavoritesController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<IActionResult> GetList([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized("User is not authenticated.");
        }

        var response = await _sender.Send(new GetFavoritesListQuery(userId, pageNumber, pageSize));
        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateFavoriteCommand command)
    {
        var response = await _sender.Send(command);
        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _sender.Send(new DeleteFavoriteCommand(id));
        return NoContent();
    }
}
