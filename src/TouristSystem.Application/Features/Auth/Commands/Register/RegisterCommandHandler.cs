using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Interfaces;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Auth.Commands.Register;

/// <summary>
/// Handles RegisterCommand requests, validating credentials uniqueness and saving new Tourist accounts.
/// </summary>
public class RegisterCommandHandler : IRequestHandler<RegisterCommand, RegisterResponse>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtProvider _jwtProvider;

    public RegisterCommandHandler(
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher,
        IJwtProvider jwtProvider)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _jwtProvider = jwtProvider;
    }

    public async Task<RegisterResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        if (await _unitOfWork.Users.EmailExistsAsync(request.Email, cancellationToken))
        {
            throw new InvalidOperationException($"Email '{request.Email}' is already registered.");
        }

        var passwordHash = _passwordHasher.Hash(request.Password);

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = passwordHash,
            PhoneNumber = request.PhoneNumber,
            Role = UserRole.Tourist, // Default registered role is Tourist
            IsActive = true,
            EmailConfirmed = false
        };

        await _unitOfWork.Users.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var token = _jwtProvider.Generate(user);

        return new RegisterResponse(user.Id, user.FullName, user.Email, token);
    }
}
