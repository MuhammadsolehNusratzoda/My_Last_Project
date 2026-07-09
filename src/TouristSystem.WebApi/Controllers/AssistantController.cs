using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using TouristSystem.Application.Features.Assistant;
using TouristSystem.Application.Interfaces;

namespace TouristSystem.WebApi.Controllers;

/// <summary>
/// Handles AI travel assistant chat requests.
/// Public endpoint — no authentication required.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AssistantController : ControllerBase
{
    private readonly IAiAssistantService _assistant;

    public AssistantController(IAiAssistantService assistant)
    {
        _assistant = assistant;
    }

    /// <summary>
    /// Processes a chat message and returns an AI-generated travel response.
    /// The response is grounded in the tourism database where possible.
    /// </summary>
    [HttpPost("chat")]
    public async Task<IActionResult> Chat(
        [FromBody] AiChatRequest request,
        CancellationToken cancellationToken)
    {
        // Basic input sanitization
        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { error = "Message cannot be empty." });

        var sanitizedMessage = request.Message.Trim();
        if (sanitizedMessage.Length > 600)
            sanitizedMessage = sanitizedMessage[..600];

        var sanitized = request with { Message = sanitizedMessage };

        var response = await _assistant.GetResponseAsync(sanitized, cancellationToken);
        return Ok(response);
    }
}
