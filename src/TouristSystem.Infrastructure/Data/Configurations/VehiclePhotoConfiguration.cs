using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TouristSystem.Domain.Entities;

namespace TouristSystem.Infrastructure.Data.Configurations;

public class VehiclePhotoConfiguration : IEntityTypeConfiguration<VehiclePhoto>
{
    public void Configure(EntityTypeBuilder<VehiclePhoto> builder)
    {
        builder.ToTable("vehicle_photos");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("id");
        builder.Property(p => p.VehicleId).HasColumnName("vehicle_id").IsRequired();
        builder.Property(p => p.PhotoUrl).HasColumnName("photo_url").HasMaxLength(500).IsRequired();
        builder.Property(p => p.IsPrimary).HasColumnName("is_primary");
        builder.Property(p => p.DisplayOrder).HasColumnName("display_order");

        builder.Property(p => p.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(p => p.CreatedByUserId).HasColumnName("created_by_user_id");
        builder.Property(p => p.UpdatedAt).HasColumnName("updated_at");
        builder.Property(p => p.UpdatedByUserId).HasColumnName("updated_by_user_id");
        builder.Property(p => p.DeletedAt).HasColumnName("deleted_at");
        builder.Property(p => p.DeletedByUserId).HasColumnName("deleted_by_user_id");
        builder.Property(p => p.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);

        builder.HasQueryFilter(p => !p.IsDeleted);
    }
}
