using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TouristSystem.Domain.Entities;

namespace TouristSystem.Infrastructure.Data.Configurations;

/// <summary>
/// Database configuration for the Booking entity.
/// </summary>
public class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.ToTable("bookings");

        builder.HasKey(b => b.Id);
        builder.Property(b => b.Id).HasColumnName("id");

        builder.Property(b => b.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(b => b.BookingType)
            .HasColumnName("booking_type")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(b => b.ReferenceId)
            .HasColumnName("reference_id")
            .IsRequired();

        builder.Property(b => b.StartDate)
            .HasColumnName("start_date")
            .IsRequired();

        builder.Property(b => b.EndDate)
            .HasColumnName("end_date")
            .IsRequired();

        builder.Property(b => b.GuestsCount)
            .HasColumnName("guests_count")
            .IsRequired();

        builder.Property(b => b.Quantity)
            .HasColumnName("quantity")
            .HasDefaultValue(1)
            .IsRequired();

        builder.Property(b => b.TotalPrice)
            .HasColumnName("total_price")
            .HasPrecision(12, 2)
            .IsRequired();

        builder.Property(b => b.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(b => b.Notes)
            .HasColumnName("notes");

        builder.Property(b => b.ConfirmedAt)
            .HasColumnName("confirmed_at");

        builder.Property(b => b.CancelledAt)
            .HasColumnName("cancelled_at");

        // Audit fields
        builder.Property(b => b.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(b => b.CreatedByUserId).HasColumnName("created_by_user_id");
        builder.Property(b => b.UpdatedAt).HasColumnName("updated_at");
        builder.Property(b => b.UpdatedByUserId).HasColumnName("updated_by_user_id");
        builder.Property(b => b.DeletedAt).HasColumnName("deleted_at");
        builder.Property(b => b.DeletedByUserId).HasColumnName("deleted_by_user_id");
        builder.Property(b => b.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Indexes
        builder.HasIndex(b => b.UserId)
            .HasDatabaseName("idx_bookings_user_id");

        builder.HasIndex(b => b.Status)
            .HasDatabaseName("idx_bookings_status");

        builder.HasIndex(b => new { b.BookingType, b.ReferenceId })
            .HasDatabaseName("idx_bookings_polymorphic");

        // Relationships
        builder.HasOne(b => b.User)
            .WithMany()
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Query filter
        builder.HasQueryFilter(b => !b.IsDeleted);

        // Constraints
        builder.ToTable(tbl => tbl.HasCheckConstraint("CK_Bookings_TotalPrice", "total_price >= 0"));
        builder.ToTable(tbl => tbl.HasCheckConstraint("CK_Bookings_Guests", "guests_count > 0"));
        builder.ToTable(tbl => tbl.HasCheckConstraint("CK_Bookings_Quantity", "quantity > 0"));
        builder.ToTable(tbl => tbl.HasCheckConstraint("CK_Bookings_Dates", "end_date >= start_date"));
    }
}
