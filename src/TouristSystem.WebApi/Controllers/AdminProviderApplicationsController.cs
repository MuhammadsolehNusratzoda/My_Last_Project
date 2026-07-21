using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TouristSystem.Application.Features.AdminProviders.Commands.ApproveProviderApplication;
using TouristSystem.Application.Features.AdminProviders.Commands.RejectProviderApplication;
using TouristSystem.Application.Features.AdminProviders.Commands.SuspendProviderApplication;
using TouristSystem.Application.Features.AdminProviders.Commands.UpdateVerificationChecklist;
using TouristSystem.Application.Features.AdminProviders.Queries.GetAdminProviderApplicationsList;
using TouristSystem.Application.Features.ProviderRegistration.Queries.GetMyProviderApplication;

namespace TouristSystem.WebApi.Controllers;

/// <summary>
/// Administrator management endpoints for Passenger Transport Provider applications.
/// </summary>
[ApiController]
[Route("api/admin/provider-applications")]
[Authorize(Roles = "Admin,SuperAdmin")]
public class AdminProviderApplicationsController : ControllerBase
{
    private readonly ISender _sender;

    public AdminProviderApplicationsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<IActionResult> GetList([FromQuery] GetAdminProviderApplicationsListQuery query)
    {
        var result = await _sender.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetDetail(Guid id)
    {
        var result = await _sender.Send(new GetMyProviderApplicationQuery(id));
        if (result == null) return NotFound("Provider application not found.");
        return Ok(result);
    }

    [HttpPut("{id}/approve")]
    public async Task<IActionResult> Approve(Guid id, [FromBody] ApproveRequestDto dto)
    {
        await _sender.Send(new ApproveProviderApplicationCommand(id, dto.AdminNotes));
        return Ok(new { message = "Provider application approved successfully." });
    }

    [HttpPut("{id}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectRequestDto dto)
    {
        await _sender.Send(new RejectProviderApplicationCommand(id, dto.RejectionReason, dto.AdminNotes));
        return Ok(new { message = "Provider application rejected." });
    }

    [HttpPut("{id}/suspend")]
    public async Task<IActionResult> Suspend(Guid id, [FromBody] SuspendRequestDto dto)
    {
        await _sender.Send(new SuspendProviderApplicationCommand(id, dto.Reason));
        return Ok(new { message = "Provider application suspended." });
    }

    [HttpPut("{id}/verification-checklist")]
    public async Task<IActionResult> UpdateVerificationChecklist(Guid id, [FromBody] UpdateVerificationChecklistCommand command)
    {
        var request = command with { ProviderId = id };
        await _sender.Send(request);
        return Ok(new { message = "Verification checklist updated." });
    }
}

public record ApproveRequestDto(string? AdminNotes);
public record RejectRequestDto(string RejectionReason, string? AdminNotes);
public record SuspendRequestDto(string Reason);
