using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TouristSystem.Domain.Entities;

namespace TouristSystem.Infrastructure.Data.Configurations;

public class ProviderWorkingHourConfiguration : IEntityTypeConfiguration<ProviderWorkingHour>
{
    public void Configure(EntityTypeBuilder<ProviderWorkingHour> builder)
    {
        builder.ToTable("provider_working_hours");

        builder.HasKey(w => w.Id);
        builder.Property(w => w.Id).HasColumnName("id");
        builder.Property(w => w.ProviderProfileId).HasColumnName("provider_profile_id").IsRequired();
        builder.Property(w => w.DayOfWeek).HasColumnName("day_of_week").HasMaxLength(20).IsRequired();
        builder.Property(w => w.StartTime).HasColumnName("start_time").IsRequired();
        builder.Property(w => w.EndTime).HasColumnName("end_time").IsRequired();
        builder.Property(w => w.Is24Hours).HasColumnName("is_24_hours").HasDefaultValue(false);

        builder.Property(w => w.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(w => w.CreatedByUserId).HasColumnName("created_by_user_id");
        builder.Property(w => w.UpdatedAt).HasColumnName("updated_at");
        builder.Property(w => w.UpdatedByUserId).HasColumnName("updated_by_user_id");
        builder.Property(w => w.DeletedAt).HasColumnName("deleted_at");
        builder.Property(w => w.DeletedByUserId).HasColumnName("deleted_by_user_id");
        builder.Property(w => w.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);

        builder.HasQueryFilter(w => !w.IsDeleted);
    }
}
