using FluentValidation;

namespace TouristSystem.Application.Features.Reviews.Commands.CreateReview;

/// <summary>
/// Enforces business validation rules for CreateReviewCommand parameters.
/// </summary>
public class CreateReviewCommandValidator : AbstractValidator<CreateReviewCommand>
{
    public CreateReviewCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User Id is required.");

        RuleFor(x => x.ReviewType)
            .NotEmpty().WithMessage("Review type is required.")
            .Must(t => t == "Place" || t == "Hotel" || t == "Restaurant" || t == "Guide")
            .WithMessage("Review type must be Place, Hotel, Restaurant, or Guide.");

        RuleFor(x => x.ReferenceId)
            .NotEmpty().WithMessage("Reference Id is required.");

        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5 stars.");

        RuleFor(x => x.Comment)
            .NotEmpty().WithMessage("Review comment is required.")
            .MaximumLength(500).WithMessage("Comment must not exceed 500 characters.");
    }
}
