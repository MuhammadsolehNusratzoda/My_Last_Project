using System;
using MediatR;

namespace TouristSystem.Application.Features.Restaurants.Commands.DeleteRestaurant;

/// <summary>
/// CQRS request record to delete a Restaurant.
/// </summary>
public record DeleteRestaurantCommand(Guid Id) : IRequest;
