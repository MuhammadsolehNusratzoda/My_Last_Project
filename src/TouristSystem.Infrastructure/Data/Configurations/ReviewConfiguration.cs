using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TouristSystem.Domain.Entities;

namespace TouristSystem.Infrastructure.Data.Configurations;

/// <summary>
/// Database configuration for the Review entity.
/// </summary>
public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.ToTable("reviews");

        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).HasColumnName("id");

        builder.Property(r => r.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(r => r.ReviewType)
            .HasColumnName("review_type")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(r => r.ReferenceId)
            .HasColumnName("reference_id")
            .IsRequired();

        builder.Property(r => r.Rating)
            .HasColumnName("rating")
            .IsRequired();

        builder.Property(r => r.Comment)
            .HasColumnName("comment")
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
        builder.HasIndex(r => r.UserId)
            .HasDatabaseName("idx_reviews_user_id");

        builder.HasIndex(r => new { r.ReviewType, r.ReferenceId })
            .HasDatabaseName("idx_reviews_polymorphic");

        // Relationships
        builder.HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Query filter
        builder.HasQueryFilter(r => !r.IsDeleted);

        // Constraints
        builder.ToTable(tbl => tbl.HasCheckConstraint("CK_Reviews_Rating", "rating BETWEEN 1 AND 5"));
    }
}
