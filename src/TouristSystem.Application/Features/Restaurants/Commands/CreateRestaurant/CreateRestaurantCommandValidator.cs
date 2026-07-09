using FluentValidation;

namespace TouristSystem.Application.Features.Restaurants.Commands.CreateRestaurant;

/// <summary>
/// Enforces business validation rules for CreateRestaurantCommand parameters.
/// </summary>
public class CreateRestaurantCommandValidator : AbstractValidator<CreateRestaurantCommand>
{
    public CreateRestaurantCommandValidator()
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

        RuleFor(x => x.CuisineType)
            .NotEmpty().WithMessage("Cuisine type is required.")
            .MaximumLength(100).WithMessage("Cuisine type must not exceed 100 characters.");

        RuleFor(x => x.PriceRange)
            .NotEmpty().WithMessage("Price range is required.")
            .Must(p => p == "Cheap" || p == "Medium" || p == "Expensive")
            .WithMessage("Price range must be Cheap, Medium, or Expensive.");

        RuleFor(x => x.OpeningHours)
            .NotEmpty().WithMessage("Opening hours description is required.")
            .MaximumLength(100).WithMessage("Opening hours must not exceed 100 characters.");
    }
}
