using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TouristSystem.Domain.Entities;

namespace TouristSystem.Infrastructure.Data.Configurations;

/// <summary>
/// Database configuration for the PartnerExpense entity.
/// </summary>
public class PartnerExpenseConfiguration : IEntityTypeConfiguration<PartnerExpense>
{
    public void Configure(EntityTypeBuilder<PartnerExpense> builder)
    {
        builder.ToTable("partner_expenses");

        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasColumnName("id");

        builder.Property(e => e.PartnerId)
            .HasColumnName("partner_id")
            .IsRequired();

        builder.Property(e => e.Category)
            .HasColumnName("category")
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(e => e.Amount)
            .HasColumnName("amount")
            .HasPrecision(12, 2)
            .IsRequired();

        builder.Property(e => e.ExpenseDate)
            .HasColumnName("expense_date")
            .IsRequired();

        builder.Property(e => e.Description)
            .HasColumnName("description")
            .HasMaxLength(500);

        builder.Property(e => e.ListingType)
            .HasColumnName("listing_type")
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(e => e.ListingId)
            .HasColumnName("listing_id");

        builder.Property(e => e.ReceiptUrl)
            .HasColumnName("receipt_url")
            .HasMaxLength(500);

        builder.Property(e => e.IsRecurring)
            .HasColumnName("is_recurring")
            .HasDefaultValue(false)
            .IsRequired();

        // Audit fields
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        builder.Property(e => e.UpdatedByUserId).HasColumnName("updated_by_user_id");
        builder.Property(e => e.DeletedAt).HasColumnName("deleted_at");
        builder.Property(e => e.DeletedByUserId).HasColumnName("deleted_by_user_id");
        builder.Property(e => e.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false).IsRequired();

        builder.HasIndex(e => new { e.PartnerId, e.ExpenseDate })
            .HasDatabaseName("idx_partner_expenses_partner_date");

        builder.HasOne(e => e.Partner)
            .WithMany()
            .HasForeignKey(e => e.PartnerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(e => !e.IsDeleted);

        builder.ToTable(tbl => tbl.HasCheckConstraint("CK_PartnerExpenses_Amount", "amount > 0"));
    }
}
