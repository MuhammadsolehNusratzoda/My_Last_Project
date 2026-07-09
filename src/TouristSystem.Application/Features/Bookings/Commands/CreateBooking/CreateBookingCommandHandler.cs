using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Enums;
using TouristSystem.Domain.Interfaces;

namespace TouristSystem.Application.Features.Bookings.Commands.CreateBooking;

/// <summary>
/// Handles CreateBookingCommand requests, calculating prices and decrementing capacities.
/// </summary>
public class CreateBookingCommandHandler : IRequestHandler<CreateBookingCommand, Guid>
{
    private readonly IUnitOfWork _unitOfWork;

    public CreateBookingCommandHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID '{request.UserId}' was not found.");
        }

        if (!Enum.TryParse<BookingType>(request.BookingType, true, out var type))
        {
            throw new ArgumentException("Invalid booking type.");
        }

        decimal totalPrice = 0;

        if (type == BookingType.Hotel)
        {
            var hotel = await _unitOfWork.Hotels.GetByIdAsync(request.ReferenceId, cancellationToken);
            if (hotel == null)
            {
                throw new KeyNotFoundException($"Hotel with ID '{request.ReferenceId}' was not found.");
            }

            if (hotel.AvailableRooms < request.Quantity)
            {
                throw new InvalidOperationException("Not enough available rooms in the requested Hotel.");
            }

            hotel.AvailableRooms -= request.Quantity;
            _unitOfWork.Hotels.Update(hotel);

            var days = (decimal)(request.EndDate.Date - request.StartDate.Date).TotalDays;
            if (days <= 0) days = 1;

            totalPrice = hotel.PricePerNight * request.Quantity * days;
        }
        else if (type == BookingType.Transport)
        {
            var transport = await _unitOfWork.Transports.GetByIdAsync(request.ReferenceId, cancellationToken);
            if (transport == null)
            {
                throw new KeyNotFoundException($"Transport with ID '{request.ReferenceId}' was not found.");
            }

            if (transport.AvailableSeats < request.Quantity)
            {
                throw new InvalidOperationException("Not enough available seats on this transport route.");
            }

            transport.AvailableSeats -= request.Quantity;
            _unitOfWork.Transports.Update(transport);

            totalPrice = transport.PricePerSeat * request.Quantity;
        }
        else if (type == BookingType.Guide)
        {
            var guide = await _unitOfWork.Guides.GetByIdAsync(request.ReferenceId, cancellationToken);
            if (guide == null)
            {
                throw new KeyNotFoundException($"Guide profile with ID '{request.ReferenceId}' was not found.");
            }

            if (!guide.IsAvailable)
            {
                throw new InvalidOperationException("The requested Guide is not available.");
            }

            guide.IsAvailable = false;
            _unitOfWork.Guides.Update(guide);

            var days = (decimal)(request.EndDate.Date - request.StartDate.Date).TotalDays;
            if (days <= 0) days = 1;

            totalPrice = guide.PricePerDay * days;
        }

        var booking = new Booking
        {
            UserId = request.UserId,
            BookingType = type,
            ReferenceId = request.ReferenceId,
            StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc),
            EndDate = DateTime.SpecifyKind(request.EndDate, DateTimeKind.Utc),
            GuestsCount = request.GuestsCount,
            Quantity = request.Quantity,
            TotalPrice = totalPrice,
            Status = BookingStatus.Pending,
            Notes = request.Notes
        };

        await _unitOfWork.Bookings.AddAsync(booking, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return booking.Id;
    }
}
