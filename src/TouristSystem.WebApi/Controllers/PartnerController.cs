using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TouristSystem.Application.Features.Partner.Commands;
using TouristSystem.Application.Features.Partner.Queries;

namespace TouristSystem.WebApi.Controllers;

/// <summary>
/// Partner Portal API for hotel / restaurant / transport owners and guides.
/// The partner is always the authenticated user — no owner ID is ever accepted from the client.
/// </summary>
[ApiController]
[Route("api/partner")]
[Authorize(Roles = "HotelOwner,RestaurantOwner,TransportOwner,Guide,Admin,SuperAdmin")]
public class PartnerController : ControllerBase
{
    private readonly ISender _sender;

    public PartnerController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Dashboard KPIs and today's arrivals.</summary>
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        return Ok(await _sender.Send(new GetPartnerSummaryQuery()));
    }

    /// <summary>Paged bookings. Filters: status, from, to (yyyy-MM-dd), search (traveler name/email).</summary>
    [HttpGet("bookings")]
    public async Task<IActionResult> GetBookings([FromQuery] GetPartnerBookingsQuery query)
    {
        return Ok(await _sender.Send(query));
    }

    [HttpGet("bookings/{id:guid}")]
    public async Task<IActionResult> GetBooking(Guid id)
    {
        var booking = await _sender.Send(new GetPartnerBookingDetailQuery(id));
        return booking == null ? NotFound() : Ok(booking);
    }

    [HttpPost("bookings/{id:guid}/confirm")]
    public async Task<IActionResult> Confirm(Guid id)
    {
        await _sender.Send(new ChangePartnerBookingStatusCommand(id, PartnerBookingAction.Confirm, null));
        return NoContent();
    }

    [HttpPost("bookings/{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] PartnerBookingReasonDto body)
    {
        await _sender.Send(new ChangePartnerBookingStatusCommand(id, PartnerBookingAction.Reject, body?.Reason));
        return NoContent();
    }

    [HttpPost("bookings/{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id)
    {
        await _sender.Send(new ChangePartnerBookingStatusCommand(id, PartnerBookingAction.Complete, null));
        return NoContent();
    }

    [HttpPost("bookings/{id:guid}/no-show")]
    public async Task<IActionResult> NoShow(Guid id, [FromBody] PartnerBookingReasonDto? body)
    {
        await _sender.Send(new ChangePartnerBookingStatusCommand(id, PartnerBookingAction.NoShow, body?.Reason));
        return NoContent();
    }

    /// <summary>All listings owned by the current partner.</summary>
    [HttpGet("listings")]
    public async Task<IActionResult> GetListings()
    {
        return Ok(await _sender.Send(new GetPartnerListingsQuery()));
    }
}

public record PartnerBookingReasonDto(string? Reason);
