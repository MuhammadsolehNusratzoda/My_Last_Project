using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using TouristSystem.Application.Interfaces;
using TouristSystem.Domain.Interfaces;
using TouristSystem.Infrastructure.Authentication;
using TouristSystem.Infrastructure.Data;
using TouristSystem.Infrastructure.Repositories;

namespace TouristSystem.Infrastructure;

/// <summary>
/// Extension methods to configure and register infrastructure layer dependencies.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(
                connectionString,
                b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

        // Bind and register JWT options
        var jwtSection = configuration.GetSection("Jwt");
        services.Configure<JwtOptions>(jwtSection);

        services.AddScoped<IJwtProvider, JwtProvider>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();

        // Repositories & Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        var jwtOptions = jwtSection.Get<JwtOptions>();
        var key = Encoding.UTF8.GetBytes(jwtOptions?.SecretKey ?? "DefaultSecretKeyPlaceholderThatIsVeryLongAndSecure");

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtOptions?.Issuer,
                ValidAudience = jwtOptions?.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ClockSkew = System.TimeSpan.Zero
            };
        });

        return services;
    }
}
