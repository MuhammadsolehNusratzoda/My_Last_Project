using System;
using System.Security.Claims;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TouristSystem.Application.Features.ProviderRegistration.Commands.SaveRegistrationDraft;
using TouristSystem.Application.Features.ProviderRegistration.Commands.SubmitRegistrationApplication;
using TouristSystem.Application.Features.ProviderRegistration.Commands.UploadProviderDocument;
using TouristSystem.Application.Features.ProviderRegistration.DTOs;
using TouristSystem.Application.Features.ProviderRegistration.Queries.GetMyProviderApplication;

namespace TouristSystem.WebApi.Controllers;

/// <summary>
/// Endpoints for Passenger Transport Provider registration wizard and document uploads.
/// </summary>
[ApiController]
[Route("api/provider-registration")]
[Authorize]
public class ProviderRegistrationController : ControllerBase
{
    private readonly ISender _sender;

    public ProviderRegistrationController(ISender sender)
    {
        _sender = sender;
    }

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(claim) || !Guid.TryParse(claim, out var id))
            throw new UnauthorizedAccessException("Invalid user identity.");
        return id;
    }

    [HttpGet("my-application")]
    public async Task<IActionResult> GetMyApplication()
    {
        var userId = GetCurrentUserId();
        var result = await _sender.Send(new GetMyProviderApplicationQuery(userId));
        return Ok(result);
    }

    [HttpPost("draft")]
    public async Task<IActionResult> SaveDraft([FromBody] SaveProviderDraftDto dto)
    {
        var userId = GetCurrentUserId();
        var profileId = await _sender.Send(new SaveRegistrationDraftCommand(userId, dto));
        return Ok(new { profileId, message = "Registration draft saved successfully." });
    }

    [HttpPost("submit")]
    public async Task<IActionResult> Submit([FromBody] SaveProviderDraftDto dto)
    {
        var userId = GetCurrentUserId();
        var profileId = await _sender.Send(new SubmitRegistrationApplicationCommand(userId, dto));
        return Ok(new { profileId, message = "Application submitted for administrator review." });
    }

    [HttpPost("upload-document")]
    public async Task<IActionResult> UploadDocument([FromForm] IFormFile file, [FromForm] string category)
    {
        var relativeUrl = await _sender.Send(new UploadProviderDocumentCommand(file, category));
        return Ok(new { url = relativeUrl });
    }
}
