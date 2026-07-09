using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using TouristSystem.Application.Features.Assistant;

namespace TouristSystem.Application.Interfaces;

/// <summary>
/// Defines the contract for the AI travel assistant service.
/// The implementation queries the database for context, builds a system prompt,
/// and delegates to an LLM for natural-language generation.
/// </summary>
public interface IAiAssistantService
{
    Task<AiChatResponse> GetResponseAsync(AiChatRequest request, CancellationToken cancellationToken = default);
    IAsyncEnumerable<string> GetResponseStreamAsync(AiChatRequest request, CancellationToken cancellationToken = default);
}
