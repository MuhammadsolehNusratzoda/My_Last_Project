using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TouristSystem.Domain.Entities;

namespace TouristSystem.Infrastructure.Data.Configurations;

public class ProviderVehicleConfiguration : IEntityTypeConfiguration<ProviderVehicle>
{
    public void Configure(EntityTypeBuilder<ProviderVehicle> builder)
    {
        builder.ToTable("provider_vehicles");

        builder.HasKey(v => v.Id);
        builder.Property(v => v.Id).HasColumnName("id");

        builder.Property(v => v.ProviderProfileId).HasColumnName("provider_profile_id").IsRequired();
        builder.Property(v => v.RegistrationNumber).HasColumnName("registration_number").HasMaxLength(30).IsRequired();
        builder.Property(v => v.Brand).HasColumnName("brand").HasMaxLength(50).IsRequired();
        builder.Property(v => v.Model).HasColumnName("model").HasMaxLength(50).IsRequired();
        builder.Property(v => v.ManufacturingYear).HasColumnName("manufacturing_year").IsRequired();
        builder.Property(v => v.Color).HasColumnName("color").HasMaxLength(30).IsRequired();
        builder.Property(v => v.PassengerSeats).HasColumnName("passenger_seats").IsRequired();

        builder.Property(v => v.HasAirConditioning).HasColumnName("has_air_conditioning");
        builder.Property(v => v.HasWifi).HasColumnName("has_wifi");
        builder.Property(v => v.HasLuggageSpace).HasColumnName("has_luggage_space");
        builder.Property(v => v.ChildSeatAvailable).HasColumnName("child_seat_available");
        builder.Property(v => v.WheelchairAccessible).HasColumnName("wheelchair_accessible");
        builder.Property(v => v.PetFriendly).HasColumnName("pet_friendly");
        builder.Property(v => v.SmokingAllowed).HasColumnName("smoking_allowed");

        builder.Property(v => v.RegistrationCertificateUrl).HasColumnName("registration_certificate_url").HasMaxLength(500);
        builder.Property(v => v.InsuranceCertificateUrl).HasColumnName("insurance_certificate_url").HasMaxLength(500);
        builder.Property(v => v.TechnicalInspectionCertificateUrl).HasColumnName("technical_inspection_certificate_url").HasMaxLength(500);

        builder.Property(v => v.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(v => v.CreatedByUserId).HasColumnName("created_by_user_id");
        builder.Property(v => v.UpdatedAt).HasColumnName("updated_at");
        builder.Property(v => v.UpdatedByUserId).HasColumnName("updated_by_user_id");
        builder.Property(v => v.DeletedAt).HasColumnName("deleted_at");
        builder.Property(v => v.DeletedByUserId).HasColumnName("deleted_by_user_id");
        builder.Property(v => v.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);

        builder.HasMany(v => v.Photos)
            .WithOne(p => p.Vehicle)
            .HasForeignKey(p => p.VehicleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(v => !v.IsDeleted);
    }
}
