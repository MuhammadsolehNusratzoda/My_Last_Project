using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TouristSystem.Domain.Entities;

namespace TouristSystem.Infrastructure.Data.Configurations;

/// <summary>
/// Database configuration for the Guide entity.
/// </summary>
public class GuideConfiguration : IEntityTypeConfiguration<Guide>
{
    public void Configure(EntityTypeBuilder<Guide> builder)
    {
        builder.ToTable("guides");

        builder.HasKey(g => g.Id);
        builder.Property(g => g.Id).HasColumnName("id");

        builder.Property(g => g.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(g => g.Bio)
            .HasColumnName("bio")
            .IsRequired();

        builder.Property(g => g.Languages)
            .HasColumnName("languages")
            .HasMaxLength(250)
            .IsRequired();

        builder.Property(g => g.City)
            .HasColumnName("city")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(g => g.PricePerDay)
            .HasColumnName("price_per_day")
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(g => g.ExperienceYears)
            .HasColumnName("experience_years")
            .IsRequired();

        builder.Property(g => g.RatingAverage)
            .HasColumnName("rating_average")
            .HasPrecision(3, 2)
            .HasDefaultValue(0.00m)
            .IsRequired();

        builder.Property(g => g.ReviewsCount)
            .HasColumnName("reviews_count")
            .HasDefaultValue(0)
            .IsRequired();

        builder.Property(g => g.ImageUrl)
            .HasColumnName("image_url")
            .HasMaxLength(500);

        builder.Property(g => g.IsAvailable)
            .HasColumnName("is_available")
            .HasDefaultValue(true)
            .IsRequired();

        builder.Property(g => g.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        // Audit fields
        builder.Property(g => g.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(g => g.CreatedByUserId).HasColumnName("created_by_user_id");
        builder.Property(g => g.UpdatedAt).HasColumnName("updated_at");
        builder.Property(g => g.UpdatedByUserId).HasColumnName("updated_by_user_id");
        builder.Property(g => g.DeletedAt).HasColumnName("deleted_at");
        builder.Property(g => g.DeletedByUserId).HasColumnName("deleted_by_user_id");
        builder.Property(g => g.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Indexes
        builder.HasIndex(g => g.UserId)
            .IsUnique()
            .HasDatabaseName("idx_guides_user_id");

        builder.HasIndex(g => g.City)
            .HasDatabaseName("idx_guides_city");

        builder.HasIndex(g => g.PricePerDay)
            .HasDatabaseName("idx_guides_price");

        // Relationships
        builder.HasOne(g => g.User)
            .WithOne()
            .HasForeignKey<Guide>(g => g.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Query filter
        builder.HasQueryFilter(g => !g.IsDeleted);

        // Constraints
        builder.ToTable(tbl => tbl.HasCheckConstraint("CK_Guides_PricePerDay", "price_per_day >= 0"));
        builder.ToTable(tbl => tbl.HasCheckConstraint("CK_Guides_Experience", "experience_years >= 0 AND experience_years <= 60"));
        builder.ToTable(tbl => tbl.HasCheckConstraint("CK_Guides_RatingAverage", "rating_average >= 0.00 AND rating_average <= 5.00"));
    }
}
