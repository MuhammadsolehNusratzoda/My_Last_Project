using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TouristSystem.Domain.Entities;

namespace TouristSystem.Infrastructure.Data.Configurations;

/// <summary>
/// Database configuration for the Restaurant entity.
/// </summary>
public class RestaurantConfiguration : IEntityTypeConfiguration<Restaurant>
{
    public void Configure(EntityTypeBuilder<Restaurant> builder)
    {
        builder.ToTable("restaurants");

        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).HasColumnName("id");

        builder.Property(r => r.OwnerId)
            .HasColumnName("owner_id")
            .IsRequired();

        builder.Property(r => r.Name)
            .HasColumnName("name")
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(r => r.Slug)
            .HasColumnName("slug")
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(r => r.Description)
            .HasColumnName("description")
            .IsRequired();

        builder.Property(r => r.City)
            .HasColumnName("city")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(r => r.Address)
            .HasColumnName("address")
            .HasMaxLength(250)
            .IsRequired();

        builder.Property(r => r.Latitude)
            .HasColumnName("latitude")
            .HasPrecision(9, 6);

        builder.Property(r => r.Longitude)
            .HasColumnName("longitude")
            .HasPrecision(9, 6);

        builder.Property(r => r.PhoneNumber)
            .HasColumnName("phone_number")
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(r => r.WebsiteUrl)
            .HasColumnName("website_url")
            .HasMaxLength(250);

        builder.Property(r => r.ImageUrl)
            .HasColumnName("image_url")
            .HasMaxLength(500);

        builder.Property(r => r.CuisineType)
            .HasColumnName("cuisine_type")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(r => r.PriceRange)
            .HasColumnName("price_range")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(r => r.OpeningHours)
            .HasColumnName("opening_hours")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(r => r.RatingAverage)
            .HasColumnName("rating_average")
            .HasPrecision(3, 2)
            .HasDefaultValue(0.00m)
            .IsRequired();

        builder.Property(r => r.ReviewsCount)
            .HasColumnName("reviews_count")
            .HasDefaultValue(0)
            .IsRequired();

        builder.Property(r => r.HasDelivery)
            .HasColumnName("has_delivery")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(r => r.HasWifi)
            .HasColumnName("has_wifi")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(r => r.HasParking)
            .HasColumnName("has_parking")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(r => r.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        // Audit fields
        builder.Property(r => r.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(r => r.CreatedByUserId).HasColumnName("created_by_user_id");
        builder.Property(r => r.UpdatedAt).HasColumnName("updated_at");
        builder.Property(r => r.UpdatedByUserId).HasColumnName("updated_by_user_id");
        builder.Property(r => r.DeletedAt).HasColumnName("deleted_at");
        builder.Property(r => r.DeletedByUserId).HasColumnName("deleted_by_user_id");
        builder.Property(r => r.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Indexes
        builder.HasIndex(r => r.Slug)
            .IsUnique()
            .HasDatabaseName("idx_restaurants_slug");

        builder.HasIndex(r => r.City)
            .HasDatabaseName("idx_restaurants_city");

        builder.HasIndex(r => r.CuisineType)
            .HasDatabaseName("idx_restaurants_cuisine");

        // Relationships
        builder.HasOne(r => r.Owner)
            .WithMany()
            .HasForeignKey(r => r.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Query filter
        builder.HasQueryFilter(r => !r.IsDeleted);

        // Constraints
        builder.ToTable(t => t.HasCheckConstraint("CK_Restaurants_RatingAverage", "rating_average >= 0.00 AND rating_average <= 5.00"));
    }
}
