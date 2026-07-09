using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TouristSystem.Application.Features.Reviews.Commands.CreateReview;
using TouristSystem.Application.Features.Reviews.Queries.GetReviewsList;

namespace TouristSystem.WebApi.Controllers;

/// <summary>
/// API endpoints to query and create listing Reviews.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly ISender _sender;

    public ReviewsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<IActionResult> GetList([FromQuery] GetReviewsListQuery query)
    {
        var response = await _sender.Send(query);
        return Ok(response);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateReviewCommand command)
    {
        var response = await _sender.Send(command);
        return Ok(response);
    }
}
