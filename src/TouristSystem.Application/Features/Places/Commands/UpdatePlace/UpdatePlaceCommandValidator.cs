using FluentValidation;

namespace TouristSystem.Application.Features.Places.Commands.UpdatePlace;

/// <summary>
/// Enforces business validation rules for UpdatePlaceCommand parameters.
/// </summary>
public class UpdatePlaceCommandValidator : AbstractValidator<UpdatePlaceCommand>
{
    public UpdatePlaceCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Id is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(150).WithMessage("Name must not exceed 150 characters.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.");

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required.")
            .MaximumLength(100).WithMessage("City name must not exceed 100 characters.");

        RuleFor(x => x.Address)
            .MaximumLength(250).WithMessage("Address must not exceed 250 characters.");

        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90m, 90m).WithMessage("Latitude must be between -90 and 90.");

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180m, 180m).WithMessage("Longitude must be between -180 and 180.");

        RuleFor(x => x.EntryFee)
            .GreaterThanOrEqualTo(0m).WithMessage("Entry fee must be greater than or equal to 0.");

        RuleFor(x => x.Status)
            .NotEmpty().WithMessage("Status is required.")
            .Must(s => s == "Approved" || s == "Rejected" || s == "Pending")
            .WithMessage("Status must be Approved, Rejected, or Pending.");
    }
}
