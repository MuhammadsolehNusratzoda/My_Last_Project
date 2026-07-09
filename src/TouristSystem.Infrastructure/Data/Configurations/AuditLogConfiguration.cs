using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TouristSystem.Domain.Entities;

namespace TouristSystem.Infrastructure.Data.Configurations;

/// <summary>
/// Database configuration for the AuditLog entity.
/// </summary>
public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("audit_logs");

        builder.HasKey(al => al.Id);
        builder.Property(al => al.Id).HasColumnName("id");

        builder.Property(al => al.UserId)
            .HasColumnName("user_id");

        builder.Property(al => al.Action)
            .HasColumnName("action")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(al => al.EntityName)
            .HasColumnName("entity_name")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(al => al.EntityId)
            .HasColumnName("entity_id")
            .IsRequired();

        builder.Property(al => al.OldValues)
            .HasColumnName("old_values")
            .HasColumnType("jsonb");

        builder.Property(al => al.NewValues)
            .HasColumnName("new_values")
            .HasColumnType("jsonb");

        builder.Property(al => al.IpAddress)
            .HasColumnName("ip_address")
            .HasMaxLength(45);

        builder.Property(al => al.UserAgent)
            .HasColumnName("user_agent")
            .HasMaxLength(500);

        builder.Property(al => al.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        // Indexes
        builder.HasIndex(al => new { al.EntityName, al.EntityId })
            .HasDatabaseName("idx_audit_logs_entity");

        // Relationships
        builder.HasOne(al => al.User)
            .WithMany()
            .HasForeignKey(al => al.UserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
