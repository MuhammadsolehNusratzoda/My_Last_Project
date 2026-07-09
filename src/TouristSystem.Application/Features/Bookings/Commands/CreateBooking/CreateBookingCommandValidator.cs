using System;
using FluentValidation;

namespace TouristSystem.Application.Features.Bookings.Commands.CreateBooking;

/// <summary>
/// Enforces business validation rules for CreateBookingCommand parameters.
/// </summary>
public class CreateBookingCommandValidator : AbstractValidator<CreateBookingCommand>
{
    public CreateBookingCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User Id is required.");

        RuleFor(x => x.BookingType)
            .NotEmpty().WithMessage("Booking type is required.")
            .Must(t => t == "Hotel" || t == "Transport" || t == "Guide")
            .WithMessage("Booking type must be Hotel, Transport, or Guide.");

        RuleFor(x => x.ReferenceId)
            .NotEmpty().WithMessage("Reference Id of the booked item is required.");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required.")
            .GreaterThanOrEqualTo(DateTime.Today).WithMessage("Start date cannot be in the past.");

        RuleFor(x => x.EndDate)
            .NotEmpty().WithMessage("End date is required.")
            .GreaterThanOrEqualTo(x => x.StartDate).WithMessage("End date must be on or after start date.");

        RuleFor(x => x.GuestsCount)
            .GreaterThan(0).WithMessage("Guests count must be greater than 0.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Quantity must be greater than 0.");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Notes must not exceed 500 characters.");
    }
}
