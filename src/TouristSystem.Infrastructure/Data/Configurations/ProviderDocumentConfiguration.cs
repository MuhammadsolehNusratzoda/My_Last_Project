using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TouristSystem.Domain.Entities;

namespace TouristSystem.Infrastructure.Data.Configurations;

public class ProviderDocumentConfiguration : IEntityTypeConfiguration<ProviderDocument>
{
    public void Configure(EntityTypeBuilder<ProviderDocument> builder)
    {
        builder.ToTable("provider_documents");

        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id).HasColumnName("id");
        builder.Property(d => d.ProviderProfileId).HasColumnName("provider_profile_id").IsRequired();
        builder.Property(d => d.DocumentType).HasColumnName("document_type").HasMaxLength(50).IsRequired();
        builder.Property(d => d.FileUrl).HasColumnName("file_url").HasMaxLength(500).IsRequired();
        builder.Property(d => d.FileName).HasColumnName("file_name").HasMaxLength(256).IsRequired();
        builder.Property(d => d.FileExtension).HasColumnName("file_extension").HasMaxLength(20).IsRequired();
        builder.Property(d => d.FileSizeBytes).HasColumnName("file_size_bytes").IsRequired();
        builder.Property(d => d.MimeType).HasColumnName("mime_type").HasMaxLength(100).IsRequired();
        builder.Property(d => d.IsVerified).HasColumnName("is_verified").HasDefaultValue(false);

        builder.Property(d => d.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(d => d.CreatedByUserId).HasColumnName("created_by_user_id");
        builder.Property(d => d.UpdatedAt).HasColumnName("updated_at");
        builder.Property(d => d.UpdatedByUserId).HasColumnName("updated_by_user_id");
        builder.Property(d => d.DeletedAt).HasColumnName("deleted_at");
        builder.Property(d => d.DeletedByUserId).HasColumnName("deleted_by_user_id");
        builder.Property(d => d.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);

        builder.HasQueryFilter(d => !d.IsDeleted);
    }
}
