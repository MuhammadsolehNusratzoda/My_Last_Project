using FluentValidation;

namespace TouristSystem.Application.Features.Transports.Commands.CreateTransport;

/// <summary>
/// Enforces business validation rules for CreateTransportCommand parameters.
/// </summary>
public class CreateTransportCommandValidator : AbstractValidator<CreateTransportCommand>
{
    public CreateTransportCommandValidator()
    {
        RuleFor(x => x.OwnerId)
            .NotEmpty().WithMessage("Owner Id is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

        RuleFor(x => x.Type)
            .NotEmpty().WithMessage("Transport type is required.")
            .Must(t => t == "Bus" || t == "Taxi" || t == "Car" || t == "Train" || t == "Van")
            .WithMessage("Transport type must be Bus, Taxi, Car, Train, or Van.");

        RuleFor(x => x.OriginCity)
            .NotEmpty().WithMessage("Origin city is required.")
            .MaximumLength(100).WithMessage("Origin city must not exceed 100 characters.");

        RuleFor(x => x.DestinationCity)
            .NotEmpty().WithMessage("Destination city is required.")
            .MaximumLength(100).WithMessage("Destination city must not exceed 100 characters.");

        RuleFor(x => x.DepartureTime)
            .NotEmpty().WithMessage("Departure time is required.");

        RuleFor(x => x.ArrivalTime)
            .NotEmpty().WithMessage("Arrival time is required.")
            .GreaterThan(x => x.DepartureTime).WithMessage("Arrival time must be after departure time.");

        RuleFor(x => x.PricePerSeat)
            .GreaterThanOrEqualTo(0m).WithMessage("Price per seat must be greater than or equal to 0.");

        RuleFor(x => x.TotalSeats)
            .GreaterThan(0).WithMessage("Total seats must be greater than 0.");

        RuleFor(x => x.VehicleNumber)
            .NotEmpty().WithMessage("Vehicle number is required.")
            .MaximumLength(50).WithMessage("Vehicle number must not exceed 50 characters.");

        RuleFor(x => x.ContactPhone)
            .NotEmpty().WithMessage("Contact phone is required.")
            .MaximumLength(20).WithMessage("Contact phone must not exceed 20 characters.");
    }
}
