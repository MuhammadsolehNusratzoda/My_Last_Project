using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Guides.Commands.CreateGuide;

/// <summary>
/// Handles CreateGuideCommand requests, verifying roles and duplicate registrations.
/// </summary>
public class CreateGuideCommandHandler : IRequestHandler<CreateGuideCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateGuideCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateGuideCommand request, CancellationToken cancellationToken)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID '{request.UserId}' was not found.");
        }

        if (user.Role != UserRole.Guide && user.Role != UserRole.Admin && user.Role != UserRole.SuperAdmin)
        {
            throw new InvalidOperationException("Only users with the Guide role can register a guide profile.");
        }

        var existingProfile = await _unitOfWork.Guides.GetByUserIdAsync(request.UserId, cancellationToken);
        if (existingProfile != null)
        {
            throw new InvalidOperationException("A guide profile has already been registered for this user.");
        }

        var guide = new Guide
        {
            UserId = request.UserId,
            Bio = request.Bio,
            Languages = request.Languages,
            City = request.City,
            PricePerDay = request.PricePerDay,
            ExperienceYears = request.ExperienceYears,
            ImageUrl = request.ImageUrl,
            IsAvailable = true,
            Status = EntityStatus.Approved
        };

        await _unitOfWork.Guides.AddAsync(guide, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return guide.Id;
    }
}
