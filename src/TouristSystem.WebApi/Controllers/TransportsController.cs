using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TouristSystem.Application.Features.Transports.Commands.CreateTransport;
using TouristSystem.Application.Features.Transports.Commands.UpdateTransport;
using TouristSystem.Application.Features.Transports.Commands.DeleteTransport;
using TouristSystem.Application.Features.Transports.Queries.GetTransportsList;
using TouristSystem.Application.Features.Transports.Queries.GetTransportDetail;

namespace TouristSystem.WebApi.Controllers;

/// <summary>
/// API endpoints to query, create, update, and delete transit Transports.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class TransportsController : ControllerBase
{
    private readonly ISender _sender;

    public TransportsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<IActionResult> GetList([FromQuery] GetTransportsListQuery query)
    {
        var response = await _sender.Send(query);
        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDetail(Guid id)
    {
        var response = await _sender.Send(new GetTransportDetailQuery(id));
        if (response == null)
        {
            return NotFound($"Transport route listing with ID '{id}' was not found.");
        }
        return Ok(response);
    }

    [HttpPost]
    [Authorize(Roles = "TransportOwner,Admin,SuperAdmin")]
    public async Task<IActionResult> Create([FromBody] CreateTransportCommand command)
    {
        var response = await _sender.Send(command);
        return CreatedAtAction(nameof(GetDetail), new { id = response }, response);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "TransportOwner,Admin,SuperAdmin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateOrUpdateTransportDto dto)
    {
        var command = new UpdateTransportCommand(
            id,
            dto.OwnerId,
            dto.Name,
            dto.Type,
            dto.OriginCity,
            dto.DestinationCity,
            dto.DepartureTime,
            dto.ArrivalTime,
            dto.PricePerSeat,
            dto.TotalSeats,
            dto.AvailableSeats,
            dto.VehicleNumber,
            dto.ContactPhone,
            dto.Status);

        await _sender.Send(command);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "TransportOwner,Admin,SuperAdmin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _sender.Send(new DeleteTransportCommand(id));
        return NoContent();
    }
}

/// <summary>
/// Data contract for updating a Transport route.
/// </summary>
public record CreateOrUpdateTransportDto(
    Guid OwnerId,
    string Name,
    string Type,
    string OriginCity,
    string DestinationCity,
    DateTime DepartureTime,
    DateTime ArrivalTime,
    decimal PricePerSeat,
    int TotalSeats,
    int AvailableSeats,
    string VehicleNumber,
    string ContactPhone,
    string Status);
