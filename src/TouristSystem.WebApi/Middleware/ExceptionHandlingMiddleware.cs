using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace TouristSystem.WebApi.Middleware;

/// <summary>
/// Intercepts runtime errors, writes logs, and standardizes REST JSON responses.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred during request execution.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var code = HttpStatusCode.InternalServerError;
        string result;

        if (exception is KeyNotFoundException)
        {
            code = HttpStatusCode.NotFound;
            result = JsonSerializer.Serialize(new
            {
                status = (int)code,
                error = "Not Found",
                message = exception.Message
            });
        }
        else if (exception is UnauthorizedAccessException)
        {
            code = HttpStatusCode.Forbidden;
            result = JsonSerializer.Serialize(new
            {
                status = (int)code,
                error = "Forbidden",
                message = exception.Message
            });
        }
        else if (exception is FluentValidation.ValidationException valEx)
        {
            code = HttpStatusCode.BadRequest;
            var errors = valEx.Errors.Select(e => new { property = e.PropertyName, error = e.ErrorMessage });
            result = JsonSerializer.Serialize(new
            {
                status = (int)code,
                error = "Validation Failed",
                message = "One or more validation errors occurred.",
                errors
            });
        }
        else if (exception is ArgumentException || exception is InvalidOperationException)
        {
            code = HttpStatusCode.BadRequest;
            result = JsonSerializer.Serialize(new
            {
                status = (int)code,
                error = "Bad Request",
                message = exception.Message
            });
        }
        else
        {
            result = JsonSerializer.Serialize(new
            {
                status = (int)code,
                error = "Internal Server Error",
                message = "An unexpected error occurred. Please try again later."
            });
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)code;

        return context.Response.WriteAsync(result);
    }
}
