using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TouristSystem.Domain.Entities;

namespace TouristSystem.Infrastructure.Data.Configurations;

/// <summary>
/// Database configuration for the Transport entity.
/// </summary>
public class TransportConfiguration : IEntityTypeConfiguration<Transport>
{
    public void Configure(EntityTypeBuilder<Transport> builder)
    {
        builder.ToTable("transports");

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).HasColumnName("id");

        builder.Property(t => t.OwnerId)
            .HasColumnName("owner_id")
            .IsRequired();

        builder.Property(t => t.Name)
            .HasColumnName("name")
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(t => t.Type)
            .HasColumnName("type")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(t => t.OriginCity)
            .HasColumnName("origin_city")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(t => t.DestinationCity)
            .HasColumnName("destination_city")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(t => t.DepartureTime)
            .HasColumnName("departure_time")
            .IsRequired();

        builder.Property(t => t.ArrivalTime)
            .HasColumnName("arrival_time")
            .IsRequired();

        builder.Property(t => t.PricePerSeat)
            .HasColumnName("price_per_seat")
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(t => t.TotalSeats)
            .HasColumnName("total_seats")
            .IsRequired();

        builder.Property(t => t.AvailableSeats)
            .HasColumnName("available_seats")
            .IsRequired();

        builder.Property(t => t.VehicleNumber)
            .HasColumnName("vehicle_number")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(t => t.ContactPhone)
            .HasColumnName("contact_phone")
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(t => t.Status)
            .HasColumnName("status")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        // Audit fields
        builder.Property(t => t.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(t => t.CreatedByUserId).HasColumnName("created_by_user_id");
        builder.Property(t => t.UpdatedAt).HasColumnName("updated_at");
        builder.Property(t => t.UpdatedByUserId).HasColumnName("updated_by_user_id");
        builder.Property(t => t.DeletedAt).HasColumnName("deleted_at");
        builder.Property(t => t.DeletedByUserId).HasColumnName("deleted_by_user_id");
        builder.Property(t => t.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        // Indexes
        builder.HasIndex(t => new { t.OriginCity, t.DestinationCity, t.DepartureTime })
            .HasDatabaseName("idx_transports_search");

        // Relationships
        builder.HasOne(t => t.Owner)
            .WithMany()
            .HasForeignKey(t => t.OwnerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Query filter
        builder.HasQueryFilter(t => !t.IsDeleted);

        // Constraints
        builder.ToTable(tbl => tbl.HasCheckConstraint("CK_Transports_Price", "price_per_seat >= 0"));
        builder.ToTable(tbl => tbl.HasCheckConstraint("CK_Transports_Seats", "total_seats > 0 AND available_seats >= 0 AND available_seats <= total_seats"));
        builder.ToTable(tbl => tbl.HasCheckConstraint("CK_Transports_Times", "arrival_time > departure_time"));
    }
}
