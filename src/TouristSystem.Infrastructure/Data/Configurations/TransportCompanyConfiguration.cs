using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TouristSystem.Domain.Entities;

namespace TouristSystem.Infrastructure.Data.Configurations;

public class TransportCompanyConfiguration : IEntityTypeConfiguration<TransportCompany>
{
    public void Configure(EntityTypeBuilder<TransportCompany> builder)
    {
        builder.ToTable("transport_companies");

        builder.HasKey(tc => tc.Id);
        builder.Property(tc => tc.Id).HasColumnName("id");

        builder.Property(tc => tc.Name)
            .HasColumnName("name")
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(tc => tc.OperatingCities)
            .HasColumnName("operating_cities")
            .IsRequired();

        builder.Property(tc => tc.IsApproved)
            .HasColumnName("is_approved")
            .HasDefaultValue(true);

        builder.Property(tc => tc.IsSystemDefault)
            .HasColumnName("is_system_default")
            .HasDefaultValue(false);

        // Audit fields
        builder.Property(tc => tc.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(tc => tc.CreatedByUserId).HasColumnName("created_by_user_id");
        builder.Property(tc => tc.UpdatedAt).HasColumnName("updated_at");
        builder.Property(tc => tc.UpdatedByUserId).HasColumnName("updated_by_user_id");
        builder.Property(tc => tc.DeletedAt).HasColumnName("deleted_at");
        builder.Property(tc => tc.DeletedByUserId).HasColumnName("deleted_by_user_id");
        builder.Property(tc => tc.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);

        builder.HasQueryFilter(tc => !tc.IsDeleted);
    }
}
