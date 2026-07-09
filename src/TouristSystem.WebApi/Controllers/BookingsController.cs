using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TouristSystem.Application.Features.Bookings.Commands.CreateBooking;
using TouristSystem.Application.Features.Bookings.Commands.ConfirmBooking;
using TouristSystem.Application.Features.Bookings.Commands.CancelBooking;
using TouristSystem.Application.Features.Bookings.Queries.GetBookingsList;
using TouristSystem.Application.Features.Bookings.Queries.GetBookingDetail;

namespace TouristSystem.WebApi.Controllers;

/// <summary>
/// API endpoints to query, create, confirm, and cancel Bookings.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly ISender _sender;

    public BookingsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<IActionResult> GetList([FromQuery] GetBookingsListQuery query)
    {
        var response = await _sender.Send(query);
        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDetail(Guid id)
    {
        var response = await _sender.Send(new GetBookingDetailQuery(id));
        if (response == null)
        {
            return NotFound($"Booking with ID '{id}' was not found.");
        }
        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookingCommand command)
    {
        var response = await _sender.Send(command);
        return CreatedAtAction(nameof(GetDetail), new { id = response }, response);
    }

    [HttpPost("{id:guid}/confirm")]
    public async Task<IActionResult> Confirm(Guid id)
    {
        await _sender.Send(new ConfirmBookingCommand(id));
        return NoContent();
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        await _sender.Send(new CancelBookingCommand(id));
        return NoContent();
    }
}
