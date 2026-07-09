using System.Reflection;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace TouristSystem.Application;

/// <summary>
/// Extension methods to configure and register Application layer dependencies.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        services.AddMediatR(configuration =>
            configuration.RegisterServicesFromAssembly(assembly));

        services.AddValidatorsFromAssembly(assembly);

        return services;
    }
}
