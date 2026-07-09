using System.Collections.Generic;

namespace TouristSystem.Application.Features.Assistant;

/// <summary>
/// Represents a single message in the chat conversation history.
/// Role is either "user" or "assistant".
/// </summary>
public record ChatMessageDto(string Role, string Content);

/// <summary>
/// Incoming chat request from the frontend.
/// </summary>
public record AiChatRequest(
    string Message,
    string Language,
    string? ConversationId,
    string? UserId,
    List<ChatMessageDto>? History);

/// <summary>
/// Outgoing AI response returned to the frontend.
/// </summary>
public record AiChatResponse(string Reply, string ConversationId);
