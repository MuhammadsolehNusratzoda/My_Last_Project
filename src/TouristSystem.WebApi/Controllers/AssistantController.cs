using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
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

    /// <summary>
    /// Processes a chat message and streams the AI-generated travel response chunk-by-chunk using Server-Sent Events (SSE).
    /// </summary>
    [HttpPost("chat-stream")]
    public async Task ChatStream(
        [FromBody] AiChatRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            Response.StatusCode = 400;
            Response.ContentType = "text/plain";
            await Response.WriteAsync("Message cannot be empty.", cancellationToken);
            return;
        }

        var sanitizedMessage = request.Message.Trim();
        if (sanitizedMessage.Length > 600)
            sanitizedMessage = sanitizedMessage[..600];

        var sanitized = request with { Message = sanitizedMessage };

        Response.ContentType = "text/event-stream";
        Response.Headers.CacheControl = "no-cache";
        Response.Headers.Connection = "keep-alive";

        // Flush headers immediately to establish connection
        await Response.Body.FlushAsync(cancellationToken);

        await foreach (var chunk in _assistant.GetResponseStreamAsync(sanitized, cancellationToken))
        {
            var dataLine = $"data: {JsonSerializer.Serialize(chunk)}\n\n";
            await Response.WriteAsync(dataLine, cancellationToken);
            await Response.Body.FlushAsync(cancellationToken);
        }
    }
}
