using System;
using MediatR;

namespace TouristSystem.Application.Features.Favorites.Commands.DeleteFavorite;

/// <summary>
/// CQRS request record to delete a bookmarked listing.
/// </summary>
public record DeleteFavoriteCommand(Guid Id) : IRequest;
