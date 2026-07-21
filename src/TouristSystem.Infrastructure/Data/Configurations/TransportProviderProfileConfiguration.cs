using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TouristSystem.Domain.Entities;

namespace TouristSystem.Infrastructure.Data.Configurations;

public class TransportProviderProfileConfiguration : IEntityTypeConfiguration<TransportProviderProfile>
{
    public void Configure(EntityTypeBuilder<TransportProviderProfile> builder)
    {
        builder.ToTable("transport_provider_profiles");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("id");

        builder.Property(p => p.UserId).HasColumnName("user_id").IsRequired();
        builder.Property(p => p.CompanyId).HasColumnName("company_id");
        builder.Property(p => p.CustomCompanyName).HasColumnName("custom_company_name").HasMaxLength(150);

        builder.Property(p => p.EmploymentType)
            .HasColumnName("employment_type")
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(p => p.YearsWithCompany).HasColumnName("years_with_company");

        builder.Property(p => p.FullName).HasColumnName("full_name").HasMaxLength(100).IsRequired();
        builder.Property(p => p.DateOfBirth).HasColumnName("date_of_birth").IsRequired();
        builder.Property(p => p.Age).HasColumnName("age").IsRequired();
        builder.Property(p => p.Gender).HasColumnName("gender").HasMaxLength(20);
        builder.Property(p => p.Phone).HasColumnName("phone").HasMaxLength(30).IsRequired();
        builder.Property(p => p.Email).HasColumnName("email").HasMaxLength(256);
        builder.Property(p => p.Nationality).HasColumnName("nationality").HasMaxLength(100);
        builder.Property(p => p.CurrentCity).HasColumnName("current_city").HasMaxLength(100).IsRequired();
        builder.Property(p => p.CurrentAddress).HasColumnName("current_address").HasMaxLength(250).IsRequired();
        builder.Property(p => p.ProfilePhotoUrl).HasColumnName("profile_photo_url").HasMaxLength(500);

        builder.Property(p => p.YearsDrivingExperience).HasColumnName("years_driving_experience");
        builder.Property(p => p.IsProfessionalDriver).HasColumnName("is_professional_driver");
        builder.Property(p => p.PreviousCompany).HasColumnName("previous_company").HasMaxLength(150);

        builder.Property(p => p.LicenseNumber).HasColumnName("license_number").HasMaxLength(50).IsRequired();
        builder.Property(p => p.LicenseCategory).HasColumnName("license_category").HasMaxLength(20).IsRequired();
        builder.Property(p => p.LicenseIssueDate).HasColumnName("license_issue_date").IsRequired();
        builder.Property(p => p.LicenseExpirationDate).HasColumnName("license_expiration_date").IsRequired();
        builder.Property(p => p.LicenseFrontPhotoUrl).HasColumnName("license_front_photo_url").HasMaxLength(500);
        builder.Property(p => p.LicenseBackPhotoUrl).HasColumnName("license_back_photo_url").HasMaxLength(500);

        builder.Property(p => p.EmergencyContactName).HasColumnName("emergency_contact_name").HasMaxLength(100);
        builder.Property(p => p.EmergencyContactPhone).HasColumnName("emergency_contact_phone").HasMaxLength(30);

        builder.Property(p => p.ApplicationStatus)
            .HasColumnName("application_status")
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(p => p.DriverStatus)
            .HasColumnName("driver_status")
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(p => p.RatingAverage).HasColumnName("rating_average").HasPrecision(3, 2);
        builder.Property(p => p.CompletedTripsCount).HasColumnName("completed_trips_count");

        builder.Property(p => p.IsIdentityVerified).HasColumnName("is_identity_verified");
        builder.Property(p => p.IsLicenseVerified).HasColumnName("is_license_verified");
        builder.Property(p => p.IsVehicleVerified).HasColumnName("is_vehicle_verified");
        builder.Property(p => p.IsInsuranceVerified).HasColumnName("is_insurance_verified");
        builder.Property(p => p.IsCompanyVerified).HasColumnName("is_company_verified");

        builder.Property(p => p.RejectionReason).HasColumnName("rejection_reason");
        builder.Property(p => p.AdminInternalNotes).HasColumnName("admin_internal_notes");
        builder.Property(p => p.SubmittedAt).HasColumnName("submitted_at");
        builder.Property(p => p.ReviewedAt).HasColumnName("reviewed_at");

        // Audit fields
        builder.Property(p => p.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(p => p.CreatedByUserId).HasColumnName("created_by_user_id");
        builder.Property(p => p.UpdatedAt).HasColumnName("updated_at");
        builder.Property(p => p.UpdatedByUserId).HasColumnName("updated_by_user_id");
        builder.Property(p => p.DeletedAt).HasColumnName("deleted_at");
        builder.Property(p => p.DeletedByUserId).HasColumnName("deleted_by_user_id");
        builder.Property(p => p.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);

        // Relationships
        builder.HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Company)
            .WithMany(c => c.Providers)
            .HasForeignKey(p => p.CompanyId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.Vehicle)
            .WithOne(v => v.ProviderProfile)
            .HasForeignKey<ProviderVehicle>(v => v.ProviderProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(p => p.Service)
            .WithOne(s => s.ProviderProfile)
            .HasForeignKey<ProviderService>(s => s.ProviderProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.WorkingHours)
            .WithOne(w => w.ProviderProfile)
            .HasForeignKey(w => w.ProviderProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Documents)
            .WithOne(d => d.ProviderProfile)
            .HasForeignKey(d => d.ProviderProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(p => !p.IsDeleted);
    }
}
