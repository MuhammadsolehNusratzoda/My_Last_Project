using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TouristSystem.Domain.Entities;

namespace TouristSystem.Infrastructure.Data.Configurations;

/// <summary>
/// Database configuration for the Place entity.
/// </summary>
public class PlaceConfiguration : IEntityTypeConfiguration<Place>
{
    public void Configure(EntityTypeBuilder<Place> builder)
    {
        builder.ToTable("tourist_places");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("id");

        builder.Property(p => p.Name)
            .HasColumnName("name")
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(p => p.Slug)
            .HasColumnName("slug")
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(p => p.Description)
            .HasColumnName("description")
            .IsRequired();

        builder.Property(p => p.City)
            .HasColumnName("city")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(p => p.Address)
            .HasColumnName("address")
            .HasMaxLength(250);

        builder.Property(p => p.Latitude)
            .HasColumnName("latitude")
            .HasPrecision(9, 6);

        builder.Property(p => p.Longitude)
            .HasColumnName("longitude")
            .HasPrecision(9, 6);

        builder.Property(p => p.ImageUrl)
            .HasColumnName("image_url")
            .HasMaxLength(500);

        builder.Property(p => p.EntryFee)
            .HasColumnName("entry_fee")
            .HasPrecision(10, 2)
            .HasDefaultValue(0.00m)
            .IsRequired();

        builder.Property(p => p.RatingAverage)
            .HasColumnName("rating_average")
            .HasPrecision(3, 2)
            .HasDefaultValue(0.00m)
            .IsRequired();

        builder.Property(p => p.ReviewsCount)
            .HasColumnName("reviews_count")
            .HasDefaultValue(0)
            .IsRequired();

        builder.Property(p => p.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        // Audit fields
        builder.Property(p => p.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(p => p.CreatedByUserId).HasColumnName("created_by_user_id");
        builder.Property(p => p.UpdatedAt).HasColumnName("updated_at");
        builder.Property(p => p.UpdatedByUserId).HasColumnName("updated_by_user_id");
        builder.Property(p => p.DeletedAt).HasColumnName("deleted_at");
        builder.Property(p => p.DeletedByUserId).HasColumnName("deleted_by_user_id");
        builder.Property(p => p.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Indexes
        builder.HasIndex(p => p.Slug)
            .IsUnique()
            .HasDatabaseName("idx_places_slug");

        builder.HasIndex(p => p.City)
            .HasDatabaseName("idx_places_city");

        // Query filter for Soft Delete
        builder.HasQueryFilter(p => !p.IsDeleted);

        // Constraints
        builder.ToTable(t => t.HasCheckConstraint("CK_Places_EntryFee", "entry_fee >= 0"));
        builder.ToTable(t => t.HasCheckConstraint("CK_Places_RatingAverage", "rating_average >= 0.00 AND rating_average <= 5.00"));
    }
}
