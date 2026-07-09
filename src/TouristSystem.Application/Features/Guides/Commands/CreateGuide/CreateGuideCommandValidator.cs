using FluentValidation;

namespace TouristSystem.Application.Features.Guides.Commands.CreateGuide;

/// <summary>
/// Enforces business validation rules for CreateGuideCommand parameters.
/// </summary>
public class CreateGuideCommandValidator : AbstractValidator<CreateGuideCommand>
{
    public CreateGuideCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User Id is required.");

        RuleFor(x => x.Bio)
            .NotEmpty().WithMessage("Bio is required.")
            .MaximumLength(1000).WithMessage("Bio must not exceed 1000 characters.");

        RuleFor(x => x.Languages)
            .NotEmpty().WithMessage("Languages description is required (e.g., 'en,ru').")
            .MaximumLength(100).WithMessage("Languages must not exceed 100 characters.");

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required.")
            .MaximumLength(100).WithMessage("City must not exceed 100 characters.");

        RuleFor(x => x.PricePerDay)
            .GreaterThanOrEqualTo(0m).WithMessage("Price per day must be greater than or equal to 0.");

        RuleFor(x => x.ExperienceYears)
            .GreaterThanOrEqualTo(0).WithMessage("Experience years must be greater than or equal to 0.");

        RuleFor(x => x.ImageUrl)
            .MaximumLength(500).WithMessage("Image URL must not exceed 500 characters.");
    }
}
