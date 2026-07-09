using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Application.Interfaces;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Transports.Commands.UpdateTransport;

/// <summary>
/// Handles UpdateTransportCommand requests, enforcing authorization boundary checks.
/// </summary>
public class UpdateTransportCommandHandler : IRequestHandler<UpdateTransportCommand>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public UpdateTransportCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task Handle(UpdateTransportCommand request, CancellationToken cancellationToken)
    {
        var transport = await _unitOfWork.Transports.GetByIdAsync(request.Id, cancellationToken);

        if (transport == null)
        {
            throw new KeyNotFoundException($"Transport route with ID '{request.Id}' was not found.");
        }

        var currentUserId = _currentUserService.UserId;
        if (currentUserId == null)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        var currentUser = await _unitOfWork.Users.GetByIdAsync(currentUserId.Value, cancellationToken);
        bool isAdmin = currentUser != null && (currentUser.Role == UserRole.Admin || currentUser.Role == UserRole.SuperAdmin);

        if (transport.OwnerId != currentUserId.Value && !isAdmin)
        {
            throw new UnauthorizedAccessException("You are not authorized to edit this transport listing.");
        }

        if (!Enum.TryParse<TransportType>(request.Type, true, out var type))
        {
            type = TransportType.Bus;
        }

        transport.Name = request.Name;
        transport.Type = type;
        transport.OriginCity = request.OriginCity;
        transport.DestinationCity = request.DestinationCity;
        transport.DepartureTime = request.DepartureTime;
        transport.ArrivalTime = request.ArrivalTime;
        transport.PricePerSeat = request.PricePerSeat;
        transport.TotalSeats = request.TotalSeats;
        transport.AvailableSeats = request.AvailableSeats;
        transport.VehicleNumber = request.VehicleNumber;
        transport.ContactPhone = request.ContactPhone;

        if (Enum.TryParse<EntityStatus>(request.Status, true, out var status))
        {
            transport.Status = status;
        }

        _unitOfWork.Transports.Update(transport);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
