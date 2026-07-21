using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TouristSystem.Domain.Entities;

namespace TouristSystem.Infrastructure.Data.Configurations;

public class ProviderServiceConfiguration : IEntityTypeConfiguration<ProviderService>
{
    public void Configure(EntityTypeBuilder<ProviderService> builder)
    {
        builder.ToTable("provider_services");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasColumnName("id");
        builder.Property(s => s.ProviderProfileId).HasColumnName("provider_profile_id").IsRequired();

        builder.Property(s => s.ServiceTypes).HasColumnName("service_types").IsRequired();
        builder.Property(s => s.AvailableCities).HasColumnName("available_cities").IsRequired();
        builder.Property(s => s.LanguagesSpoken).HasColumnName("languages_spoken").IsRequired();
        builder.Property(s => s.PaymentMethods).HasColumnName("payment_methods").IsRequired();

        builder.Property(s => s.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(s => s.CreatedByUserId).HasColumnName("created_by_user_id");
        builder.Property(s => s.UpdatedAt).HasColumnName("updated_at");
        builder.Property(s => s.UpdatedByUserId).HasColumnName("updated_by_user_id");
        builder.Property(s => s.DeletedAt).HasColumnName("deleted_at");
        builder.Property(s => s.DeletedByUserId).HasColumnName("deleted_by_user_id");
        builder.Property(s => s.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);

        builder.HasQueryFilter(s => !s.IsDeleted);
    }
}
