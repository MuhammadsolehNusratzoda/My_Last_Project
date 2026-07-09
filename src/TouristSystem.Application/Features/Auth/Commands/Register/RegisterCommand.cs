using MediatR;

namespace TouristSystem.Application.Features.Auth.Commands.Register;

/// <summary>
/// CQRS request record to register a new user account.
/// </summary>
public record RegisterCommand(
    string FullName,
    string Email,
    string Password,
    string PhoneNumber) : IRequest<RegisterResponse>;
