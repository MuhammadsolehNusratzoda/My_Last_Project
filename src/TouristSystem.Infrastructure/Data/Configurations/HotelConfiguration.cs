using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TouristSystem.Domain.Entities;

namespace TouristSystem.Infrastructure.Data.Configurations;

/// <summary>
/// Database configuration for the Hotel entity.
/// </summary>
public class HotelConfiguration : IEntityTypeConfiguration<Hotel>
{
    public void Configure(EntityTypeBuilder<Hotel> builder)
    {
        builder.ToTable("hotels");

        builder.HasKey(h => h.Id);
        builder.Property(h => h.Id).HasColumnName("id");

        builder.Property(h => h.OwnerId)
            .HasColumnName("owner_id")
            .IsRequired();

        builder.Property(h => h.Name)
            .HasColumnName("name")
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(h => h.Slug)
            .HasColumnName("slug")
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(h => h.Description)
            .HasColumnName("description")
            .IsRequired();

        builder.Property(h => h.City)
            .HasColumnName("city")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(h => h.Address)
            .HasColumnName("address")
            .HasMaxLength(250)
            .IsRequired();

        builder.Property(h => h.Latitude)
            .HasColumnName("latitude")
            .HasPrecision(9, 6);

        builder.Property(h => h.Longitude)
            .HasColumnName("longitude")
            .HasPrecision(9, 6);

        builder.Property(h => h.PhoneNumber)
            .HasColumnName("phone_number")
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(h => h.WebsiteUrl)
            .HasColumnName("website_url")
            .HasMaxLength(250);

        builder.Property(h => h.ImageUrl)
            .HasColumnName("image_url")
            .HasMaxLength(500);

        builder.Property(h => h.PricePerNight)
            .HasColumnName("price_per_night")
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(h => h.Stars)
            .HasColumnName("stars")
            .IsRequired();

        builder.Property(h => h.RatingAverage)
            .HasColumnName("rating_average")
            .HasPrecision(3, 2)
            .HasDefaultValue(0.00m)
            .IsRequired();

        builder.Property(h => h.ReviewsCount)
            .HasColumnName("reviews_count")
            .HasDefaultValue(0)
            .IsRequired();

        builder.Property(h => h.TotalRooms)
            .HasColumnName("total_rooms")
            .IsRequired();

        builder.Property(h => h.AvailableRooms)
            .HasColumnName("available_rooms")
            .IsRequired();

        builder.Property(h => h.HasWifi)
            .HasColumnName("has_wifi")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(h => h.HasParking)
            .HasColumnName("has_parking")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(h => h.HasPool)
            .HasColumnName("has_pool")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(h => h.HasGym)
            .HasColumnName("has_gym")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(h => h.HasRestaurant)
            .HasColumnName("has_restaurant")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(h => h.IsFamilyFriendly)
            .HasColumnName("is_family_friendly")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(h => h.IsLuxury)
            .HasColumnName("is_luxury")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(h => h.IsBudget)
            .HasColumnName("is_budget")
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(h => h.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        // Audit fields
        builder.Property(h => h.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(h => h.CreatedByUserId).HasColumnName("created_by_user_id");
        builder.Property(h => h.UpdatedAt).HasColumnName("updated_at");
        builder.Property(h => h.UpdatedByUserId).HasColumnName("updated_by_user_id");
        builder.Property(h => h.DeletedAt).HasColumnName("deleted_at");
        builder.Property(h => h.DeletedByUserId).HasColumnName("deleted_by_user_id");
        builder.Property(h => h.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Indexes
        builder.HasIndex(h => h.Slug)
            .IsUnique()
            .HasDatabaseName("idx_hotels_slug");

        builder.HasIndex(h => h.City)
            .HasDatabaseName("idx_hotels_city");

        builder.HasIndex(h => h.PricePerNight)
            .HasDatabaseName("idx_hotels_price");

        // Relationships
        builder.HasOne(h => h.Owner)
            .WithMany()
            .HasForeignKey(h => h.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Query filter
        builder.HasQueryFilter(h => !h.IsDeleted);

        // Constraints
        builder.ToTable(t => t.HasCheckConstraint("CK_Hotels_PricePerNight", "price_per_night >= 0"));
        builder.ToTable(t => t.HasCheckConstraint("CK_Hotels_Stars", "stars BETWEEN 1 AND 5"));
        builder.ToTable(t => t.HasCheckConstraint("CK_Hotels_RatingAverage", "rating_average >= 0.00 AND rating_average <= 5.00"));
        builder.ToTable(t => t.HasCheckConstraint("CK_Hotels_Rooms", "total_rooms > 0 AND available_rooms >= 0 AND available_rooms <= total_rooms"));
    }
}
