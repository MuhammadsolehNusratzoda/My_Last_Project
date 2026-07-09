using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Places.Commands.DeletePlace;

/// <summary>
/// Handles DeletePlaceCommand requests, performing soft-deletions.
/// </summary>
public class DeletePlaceCommandHandler : IRequestHandler<DeletePlaceCommand>
{
    private readonly IUnitOfWork _unitOfWork;

    public DeletePlaceCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeletePlaceCommand request, CancellationToken cancellationToken)
    {
        var place = await _unitOfWork.Places.GetByIdAsync(request.Id, cancellationToken);

        if (place == null)
        {
            throw new KeyNotFoundException($"Tourist Place with ID '{request.Id}' was not found.");
        }

        _unitOfWork.Places.Delete(place);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
