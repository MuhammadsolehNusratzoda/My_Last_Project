using FluentValidation;

namespace TouristSystem.Application.Features.Hotels.Commands.CreateHotel;

/// <summary>
/// Enforces business validation rules for CreateHotelCommand parameters.
/// </summary>
public class CreateHotelCommandValidator : AbstractValidator<CreateHotelCommand>
{
    public CreateHotelCommandValidator()
    {
        RuleFor(x => x.OwnerId)
            .NotEmpty().WithMessage("Owner Id is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(150).WithMessage("Name must not exceed 150 characters.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.");

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required.")
            .MaximumLength(100).WithMessage("City name must not exceed 100 characters.");

        RuleFor(x => x.Address)
            .NotEmpty().WithMessage("Address is required.")
            .MaximumLength(250).WithMessage("Address must not exceed 250 characters.");

        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90m, 90m).When(x => x.Latitude.HasValue).WithMessage("Latitude must be between -90 and 90.");

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180m, 180m).When(x => x.Longitude.HasValue).WithMessage("Longitude must be between -180 and 180.");

        RuleFor(x => x.PhoneNumber)
            .NotEmpty().WithMessage("Phone number is required.")
            .MaximumLength(20).WithMessage("Phone number must not exceed 20 characters.");

        RuleFor(x => x.WebsiteUrl)
            .MaximumLength(250).WithMessage("Website URL must not exceed 250 characters.");

        RuleFor(x => x.ImageUrl)
            .MaximumLength(500).WithMessage("Image URL must not exceed 500 characters.");

        RuleFor(x => x.PricePerNight)
            .GreaterThanOrEqualTo(0m).WithMessage("Price per night must be greater than or equal to 0.");

        RuleFor(x => x.Stars)
            .InclusiveBetween(1, 5).WithMessage("Stars rating must be between 1 and 5.");

        RuleFor(x => x.TotalRooms)
            .GreaterThan(0).WithMessage("Total rooms count must be greater than 0.");
    }
}
