using System;
using MediatR;

namespace TouristSystem.Application.Features.Hotels.Commands.DeleteHotel;

/// <summary>
/// CQRS request record to delete a Hotel.
/// </summary>
public record DeleteHotelCommand(Guid Id) : IRequest;
