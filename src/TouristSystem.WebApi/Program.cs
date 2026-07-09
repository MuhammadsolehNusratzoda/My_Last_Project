using System;
using System.Text;
using TouristSystem.Application;
using TouristSystem.Application.Interfaces;
using TouristSystem.Infrastructure;
using TouristSystem.WebApi.Middleware;
using TouristSystem.WebApi.Services;
using Serilog;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Initialize Serilog Logger
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("Logs/log-.txt", rollingInterval: RollingInterval.Day, shared: true)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container.
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddControllers();

// AI Assistant Service — bind OpenAI options and register HttpClient + service
builder.Services.Configure<OpenAiOptions>(builder.Configuration.GetSection("OpenAi"));
builder.Services.AddHttpClient<IAiAssistantService, AiAssistantService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
});

// Enable Health Checks
builder.Services.AddHealthChecks();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configure Swagger with JWT Bearer inputs
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "TouristSystem API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Seed initial database records
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<TouristSystem.Infrastructure.Data.ApplicationDbContext>();
    TouristSystem.Infrastructure.Data.Seed.DatabaseSeeder.Seed(context);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Global Exception Handler Middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Serilog Request Logging
app.UseSerilogRequestLogging();

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Map Health Checks Endpoint
app.MapHealthChecks("/health");

app.Run();
