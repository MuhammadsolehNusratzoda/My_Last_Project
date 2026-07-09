using MediatR;

namespace TouristSystem.Application.Features.Auth.Commands.Login;

/// <summary>
/// CQRS request record to authenticate and log in a user.
/// </summary>
public record LoginCommand(
    string Email,
    string Password) : IRequest<LoginResponse>;
