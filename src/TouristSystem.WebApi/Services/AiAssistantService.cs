using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TouristSystem.Application.Features.Assistant;
using TouristSystem.Application.Interfaces;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.WebApi.Services;

/// <summary>
/// Core AI assistant service that:
/// 1. Searches the database for context relevant to the user's query.
/// 2. Builds a rich, multilingual system prompt with that context.
/// 3. Calls the OpenAI Chat Completions API to generate a natural response.
/// 4. Falls back to a structured DB-only response when no API key is configured.
/// </summary>
public class AiAssistantService : IAiAssistantService
{
    private readonly IUnitOfWork   _unitOfWork;
    private readonly HttpClient    _httpClient;
    private readonly OpenAiOptions _options;
    private readonly ILogger<AiAssistantService> _logger;

    public AiAssistantService(
        IUnitOfWork unitOfWork,
        HttpClient httpClient,
        IOptions<OpenAiOptions> options,
        ILogger<AiAssistantService> logger)
    {
        _unitOfWork = unitOfWork;
        _httpClient = httpClient;
        _options    = options.Value;
        _logger     = logger;
    }

    public async Task<AiChatResponse> GetResponseAsync(
        AiChatRequest request,
        CancellationToken cancellationToken = default)
    {
        var conversationId = request.ConversationId ?? Guid.NewGuid().ToString();

        // ── 1. Build database context ────────────────────────────────────────
        var context = await BuildDatabaseContextAsync(request.Message, cancellationToken);

        // ── 2. Build messages array for OpenAI ───────────────────────────────
        var systemPrompt = BuildSystemPrompt(request.Language, context);
        var messages     = BuildMessages(systemPrompt, request.History, request.Message);

        // ── 3. Call OpenAI (or fallback if no key) ───────────────────────────
        string reply;
        if (string.IsNullOrWhiteSpace(_options.ApiKey) ||
            _options.ApiKey.StartsWith("YOUR_") ||
            _options.ApiKey == "sk-placeholder")
        {
            reply = BuildFallbackResponse(request.Message, request.Language, context);
        }
        else
        {
            reply = await CallOpenAiAsync(messages, cancellationToken);
        }

        return new AiChatResponse(reply, conversationId);
    }

    public async IAsyncEnumerable<string> GetResponseStreamAsync(
        AiChatRequest request,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        // ── 1. Build database context ────────────────────────────────────────
        var context = await BuildDatabaseContextAsync(request.Message, cancellationToken);

        // ── 2. Build messages array for OpenAI ───────────────────────────────
        var systemPrompt = BuildSystemPrompt(request.Language, context);
        var messages     = BuildMessages(systemPrompt, request.History, request.Message);

        // ── 3. Call OpenAI (or fallback if no key) ───────────────────────────
        if (string.IsNullOrWhiteSpace(_options.ApiKey) ||
            _options.ApiKey.StartsWith("YOUR_") ||
            _options.ApiKey == "sk-placeholder")
        {
            var fallbackReply = BuildFallbackResponse(request.Message, request.Language, context);
            var words = fallbackReply.Split(' ');
            foreach (var word in words)
            {
                yield return word + " ";
                await Task.Delay(20, cancellationToken); // simulated streaming delay
            }
        }
        else
        {
            await foreach (var chunk in CallOpenAiStreamAsync(messages, cancellationToken))
            {
                yield return chunk;
            }
        }
    }

    private async IAsyncEnumerable<string> CallOpenAiStreamAsync(
        List<object> messages,
        [EnumeratorCancellation] CancellationToken ct)
    {
        var requestBody = new
        {
            model       = _options.Model,
            messages    = messages,
            max_tokens  = _options.MaxTokens,
            temperature = _options.Temperature,
            stream      = true
        };

        var json = JsonSerializer.Serialize(requestBody);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions")
        {
            Content = content
        };

        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.ApiKey);

        using var response = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, ct);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(ct);
            _logger.LogWarning("OpenAI API stream error {Status}: {Error}", response.StatusCode, error);
            yield return "⚠️ I'm having trouble connecting to the AI service right now. Please try again in a moment.";
            yield break;
        }

        using var stream = await response.Content.ReadAsStreamAsync(ct);
        using var reader = new StreamReader(stream);

        while (!reader.EndOfStream)
        {
            var line = await reader.ReadLineAsync(ct);
            if (string.IsNullOrWhiteSpace(line)) continue;

            if (line.StartsWith("data: "))
            {
                var data = line["data: ".Length..].Trim();
                if (data == "[DONE]") break;

                string? contentChunk = null;
                try
                {
                    using var doc = JsonDocument.Parse(data);
                    var choices = doc.RootElement.GetProperty("choices");
                    if (choices.GetArrayLength() > 0)
                    {
                        var delta = choices[0].GetProperty("delta");
                        if (delta.TryGetProperty("content", out var contentVal))
                        {
                            contentChunk = contentVal.GetString();
                        }
                    }
                }
                catch (JsonException)
                {
                    // Ignore malformed json lines
                }

                if (!string.IsNullOrEmpty(contentChunk))
                {
                    yield return contentChunk;
                }
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Database context builder
    // ─────────────────────────────────────────────────────────────────────────
    private async Task<DatabaseContext> BuildDatabaseContextAsync(
        string query,
        CancellationToken ct)
    {
        var ctx = new DatabaseContext();
        var q   = query.ToLowerInvariant();

        var keywords = q.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                        .Where(w => w.Length > 2)
                        .ToArray();

        bool Matches(string? text) =>
            text != null && keywords.Any(k => text.ToLowerInvariant().Contains(k));

        bool AnyKeyword(params string?[] fields) => fields.Any(Matches);

        // -- Places ----------------------------------------------------------
        var places = await _unitOfWork.Places.GetAllAsync(ct);
        ctx.Places = places
            .Where(p => AnyKeyword(p.Name, p.City, p.Description, p.Address))
            .Take(5)
            .Select(p => new PlaceContext(
                p.Name, p.City, p.Description, p.EntryFee,
                p.RatingAverage, p.ReviewsCount))
            .ToList();

        // Include all places if query is generic ("best places", "attractions", "visit")
        if (!ctx.Places.Any() && ContainsAny(q, "place", "attract", "sight", "visit", "tour", "ме",
            "جо", "достопримечательн", "место"))
        {
            ctx.Places = places
                .Take(8)
                .Select(p => new PlaceContext(
                    p.Name, p.City, p.Description, p.EntryFee,
                    p.RatingAverage, p.ReviewsCount))
                .ToList();
        }

        // -- Hotels ----------------------------------------------------------
        var hotels = await _unitOfWork.Hotels.GetAllAsync(ct);
        ctx.Hotels = hotels
            .Where(h => AnyKeyword(h.Name, h.City, h.Description, h.Address))
            .Take(5)
            .Select(h => new HotelContext(
                h.Name, h.City, h.Stars, h.PricePerNight,
                h.AvailableRooms, h.RatingAverage, h.HasWifi, h.HasParking, h.HasPool))
            .ToList();

        if (!ctx.Hotels.Any() && ContainsAny(q, "hotel", "stay", "room", "lodg", "sleep",
            "отель", "меҳмонхона", "ночлег"))
        {
            // Price filter detection
            var priceLimit = ExtractPriceLimit(q);
            ctx.Hotels = hotels
                .Where(h => priceLimit == null || h.PricePerNight <= priceLimit)
                .OrderBy(h => h.PricePerNight)
                .Take(8)
                .Select(h => new HotelContext(
                    h.Name, h.City, h.Stars, h.PricePerNight,
                    h.AvailableRooms, h.RatingAverage, h.HasWifi, h.HasParking, h.HasPool))
                .ToList();
        }

        // -- Restaurants -----------------------------------------------------
        var restaurants = await _unitOfWork.Restaurants.GetAllAsync(ct);
        ctx.Restaurants = restaurants
            .Where(r => AnyKeyword(r.Name, r.City, r.Description, r.CuisineType, r.Address))
            .Take(5)
            .Select(r => new RestaurantContext(
                r.Name, r.City, r.CuisineType, r.PriceRange.ToString(),
                r.RatingAverage, r.HasDelivery, r.HasWifi))
            .ToList();

        if (!ctx.Restaurants.Any() && ContainsAny(q, "restaur", "eat", "food", "dine", "cafe",
            "ресторан", "ресторанҳо", "хӯрок"))
        {
            ctx.Restaurants = restaurants
                .OrderByDescending(r => r.RatingAverage)
                .Take(8)
                .Select(r => new RestaurantContext(
                    r.Name, r.City, r.CuisineType, r.PriceRange.ToString(),
                    r.RatingAverage, r.HasDelivery, r.HasWifi))
                .ToList();
        }

        // -- Guides ----------------------------------------------------------
        var guides = await _unitOfWork.Guides.GetAllAsync(ct);
        ctx.Guides = guides
            .Where(g => AnyKeyword(g.City, g.Bio, g.Languages))
            .Take(4)
            .Select(g => new GuideContext(
                $"Guide in {g.City}", g.City, g.Languages,
                g.ExperienceYears, g.PricePerDay, g.RatingAverage))
            .ToList();

        if (!ctx.Guides.Any() && ContainsAny(q, "guide", "tour guide", "гид", "роҳбалад"))
        {
            ctx.Guides = guides
                .Where(g => g.IsAvailable)
                .Take(5)
                .Select(g => new GuideContext(
                    $"Guide in {g.City}", g.City, g.Languages,
                    g.ExperienceYears, g.PricePerDay, g.RatingAverage))
                .ToList();
        }

        return ctx;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // System prompt builder
    // ─────────────────────────────────────────────────────────────────────────
    private static string BuildSystemPrompt(string language, DatabaseContext ctx)
    {
        var langInstruction = language switch
        {
            "ru" => "You MUST respond in Russian (Русский). Do not use any other language.",
            "tj" => "You MUST respond in Tajik (Тоҷикӣ). Do not use any other language.",
            _    => "You MUST respond in English."
        };

        var sb = new StringBuilder();
        sb.AppendLine("You are TravelBot, a friendly and knowledgeable AI travel assistant for the TajikistanTravel tourism platform.");
        sb.AppendLine("You help users discover tourist attractions, hotels, restaurants, and tour guides across Tajikistan.");
        sb.AppendLine();
        sb.AppendLine($"LANGUAGE RULE: {langInstruction}");
        sb.AppendLine();
        sb.AppendLine("CORE RULES:");
        sb.AppendLine("- Always prefer data from the DATABASE CONTEXT section below when answering.");
        sb.AppendLine("- If the database has relevant data, cite specific names, prices, and ratings.");
        sb.AppendLine("- If no database data is available for a question, answer from general travel knowledge but say 'Based on general knowledge:'.");
        sb.AppendLine("- Never invent hotels, restaurants, or attractions that are supposedly in the database.");
        sb.AppendLine("- Keep responses concise, friendly, and helpful (200-400 words max).");
        sb.AppendLine("- Use bullet points and emojis to make responses visually appealing.");
        sb.AppendLine("- For trip planning, create structured day-by-day itineraries.");
        sb.AppendLine("- Voice/Personality: Act as a friendly, warm, cheerful, professional, calm, and confident young female travel assistant (20-25 years old) from the US welcoming visitors to Tajikistan.");
        sb.AppendLine("- Speaking Style: Natural, human conversational style. Use clear pronunciation and natural pauses. Never repeat words or sentences in the output. Speak exactly what is written once and only once (no redundant phrasing).");
        sb.AppendLine();

        if (ctx.HasAnyData)
        {
            sb.AppendLine("═══ DATABASE CONTEXT (use this data in your response) ═══");

            if (ctx.Places.Any())
            {
                sb.AppendLine();
                sb.AppendLine("📍 TOURIST ATTRACTIONS & PLACES:");
                foreach (var p in ctx.Places)
                {
                    sb.AppendLine($"  • {p.Name} (City: {p.City}) — Entry fee: ${p.EntryFee} | Rating: {p.Rating:F1}⭐ ({p.Reviews} reviews)");
                    if (!string.IsNullOrEmpty(p.Description))
                        sb.AppendLine($"    {p.Description.Trim().Replace('\n', ' ').Substring(0, Math.Min(120, p.Description.Length))}...");
                }
            }

            if (ctx.Hotels.Any())
            {
                sb.AppendLine();
                sb.AppendLine("🏨 HOTELS:");
                foreach (var h in ctx.Hotels)
                {
                    var amenities = new List<string>();
                    if (h.HasWifi)    amenities.Add("WiFi");
                    if (h.HasParking) amenities.Add("Parking");
                    if (h.HasPool)    amenities.Add("Pool");
                    sb.AppendLine($"  • {h.Name} ({h.Stars}★, {h.City}) — ${h.PricePerNight}/night | {h.AvailableRooms} rooms available | Rating: {h.Rating:F1}⭐");
                    if (amenities.Any()) sb.AppendLine($"    Amenities: {string.Join(", ", amenities)}");
                }
            }

            if (ctx.Restaurants.Any())
            {
                sb.AppendLine();
                sb.AppendLine("🍽️ RESTAURANTS:");
                foreach (var r in ctx.Restaurants)
                {
                    var features = new List<string>();
                    if (r.HasDelivery) features.Add("Delivery");
                    if (r.HasWifi)     features.Add("WiFi");
                    sb.AppendLine($"  • {r.Name} ({r.City}) — Cuisine: {r.Cuisine} | Price: {r.PriceRange} | Rating: {r.Rating:F1}⭐");
                    if (features.Any()) sb.AppendLine($"    Features: {string.Join(", ", features)}");
                }
            }

            if (ctx.Guides.Any())
            {
                sb.AppendLine();
                sb.AppendLine("🧭 TOUR GUIDES:");
                foreach (var g in ctx.Guides)
                {
                    sb.AppendLine($"  • {g.Name} (Based in: {g.City}) — Languages: {g.Languages} | {g.Experience} years exp. | ${g.PricePerDay}/day | Rating: {g.Rating:F1}⭐");
                }
            }

            sb.AppendLine();
            sb.AppendLine("═══ END DATABASE CONTEXT ═══");
        }
        else
        {
            sb.AppendLine("Note: No specific database matches found for this query. Answer using general knowledge about Tajikistan tourism.");
        }

        return sb.ToString();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Build OpenAI messages array
    // ─────────────────────────────────────────────────────────────────────────
    private static List<object> BuildMessages(
        string systemPrompt,
        List<ChatMessageDto>? history,
        string userMessage)
    {
        var messages = new List<object>
        {
            new { role = "system", content = systemPrompt }
        };

        // Include last 8 messages of conversation history (4 turns)
        if (history != null)
        {
            foreach (var msg in history.TakeLast(8))
            {
                messages.Add(new { role = msg.Role, content = msg.Content });
            }
        }

        messages.Add(new { role = "user", content = userMessage });
        return messages;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Call OpenAI Chat Completions API
    // ─────────────────────────────────────────────────────────────────────────
    private async Task<string> CallOpenAiAsync(List<object> messages, CancellationToken ct)
    {
        try
        {
            var requestBody = new
            {
                model       = _options.Model,
                messages    = messages,
                max_tokens  = _options.MaxTokens,
                temperature = _options.Temperature,
            };

            var json    = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _options.ApiKey);

            var response = await _httpClient.PostAsync(
                "https://api.openai.com/v1/chat/completions", content, ct);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync(ct);
                _logger.LogWarning("OpenAI API error {Status}: {Error}", response.StatusCode, error);
                return "⚠️ I'm having trouble connecting to the AI service right now. Please try again in a moment.";
            }

            var responseJson = await response.Content.ReadAsStringAsync(ct);
            using var doc    = JsonDocument.Parse(responseJson);
            var reply = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            return reply ?? "I couldn't generate a response. Please try again.";
        }
        catch (OperationCanceledException)
        {
            return "⚠️ Request timed out. Please try again.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling OpenAI API");
            return "⚠️ An error occurred. Please try again.";
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Fallback response (no API key — uses only DB data)
    // ─────────────────────────────────────────────────────────────────────────
    private static string BuildFallbackResponse(
        string query, string language, DatabaseContext ctx)
    {
        var sb = new StringBuilder();

        var greeting = language switch
        {
            "ru" => "Вот что я нашёл в нашей базе данных",
            "tj" => "Инак чизе ки дар пойгоҳи додаҳои мо ёфтам",
            _    => "Here's what I found in our database"
        };

        if (!ctx.HasAnyData)
        {
            return language switch
            {
                "ru" => "🔍 По вашему запросу ничего не найдено в базе данных. Попробуйте поискать по названию города (Душанбе, Худжанд, Панjakент) или категории (отели, рестораны, достопримечательности).",
                "tj" => "🔍 Дар пойгоҳи додаҳо чизе ёфт нашуд. Лутфан номи шаҳр (Душанбе, Хуҷанд, Панjakент) ё категорияро (меҳмонхона, ресторан, ҷойҳои ҷолиб) ворид кунед.",
                _    => "🔍 No matches found in our database for your query. Try searching by city name (Dushanbe, Khujand, Panjakent) or category (hotels, restaurants, attractions)."
            };
        }

        sb.AppendLine($"✨ {greeting}:\n");

        if (ctx.Places.Any())
        {
            sb.AppendLine(language == "ru" ? "📍 **Достопримечательности:**" :
                         language == "tj" ? "📍 **Ҷойҳои ҷолиб:**" : "📍 **Tourist Attractions:**");
            foreach (var p in ctx.Places)
                sb.AppendLine($"• **{p.Name}** ({p.City}) — {p.Rating:F1}⭐ | Вход: ${p.EntryFee}");
            sb.AppendLine();
        }

        if (ctx.Hotels.Any())
        {
            sb.AppendLine(language == "ru" ? "🏨 **Отели:**" :
                         language == "tj" ? "🏨 **Меҳмонхонаҳо:**" : "🏨 **Hotels:**");
            foreach (var h in ctx.Hotels)
                sb.AppendLine($"• **{h.Name}** ({h.Stars}★, {h.City}) — ${h.PricePerNight}/night | {h.Rating:F1}⭐");
            sb.AppendLine();
        }

        if (ctx.Restaurants.Any())
        {
            sb.AppendLine(language == "ru" ? "🍽️ **Рестораны:**" :
                         language == "tj" ? "🍽️ **Ресторанҳо:**" : "🍽️ **Restaurants:**");
            foreach (var r in ctx.Restaurants)
                sb.AppendLine($"• **{r.Name}** ({r.City}) — {r.Cuisine} | {r.Rating:F1}⭐");
            sb.AppendLine();
        }

        if (ctx.Guides.Any())
        {
            sb.AppendLine(language == "ru" ? "🧭 **Гиды:**" :
                         language == "tj" ? "🧭 **Роҳбаладон:**" : "🧭 **Tour Guides:**");
            foreach (var g in ctx.Guides)
                sb.AppendLine($"• **{g.Name}** ({g.City}) — {g.Languages} | {g.Experience} yrs | ${g.PricePerDay}/day");
        }

        return sb.ToString().Trim();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────
    private static bool ContainsAny(string text, params string[] keywords) =>
        keywords.Any(k => text.Contains(k, StringComparison.OrdinalIgnoreCase));

    private static decimal? ExtractPriceLimit(string query)
    {
        // Detect patterns like "under $100", "less than 50", "до 80$"
        var patterns = new[] { "under $", "under ", "less than ", "до ", "cheaper than " };
        foreach (var pattern in patterns)
        {
            var idx = query.IndexOf(pattern, StringComparison.OrdinalIgnoreCase);
            if (idx < 0) continue;
            var rest = query[(idx + pattern.Length)..].TrimStart('$').Split(' ')[0];
            if (decimal.TryParse(rest, out var limit)) return limit;
        }
        return null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Inner context record types
    // ─────────────────────────────────────────────────────────────────────────
    private class DatabaseContext
    {
        public List<PlaceContext>      Places      { get; set; } = new();
        public List<HotelContext>      Hotels      { get; set; } = new();
        public List<RestaurantContext> Restaurants { get; set; } = new();
        public List<GuideContext>      Guides      { get; set; } = new();
        public bool HasAnyData => Places.Any() || Hotels.Any() || Restaurants.Any() || Guides.Any();
    }

    private record PlaceContext(string Name, string City, string Description,
        decimal EntryFee, decimal Rating, int Reviews);

    private record HotelContext(string Name, string City, int Stars,
        decimal PricePerNight, int AvailableRooms, decimal Rating,
        bool HasWifi, bool HasParking, bool HasPool);

    private record RestaurantContext(string Name, string City, string Cuisine,
        string PriceRange, decimal Rating, bool HasDelivery, bool HasWifi);

    private record GuideContext(string Name, string City, string Languages,
        int Experience, decimal PricePerDay, decimal Rating);
}
