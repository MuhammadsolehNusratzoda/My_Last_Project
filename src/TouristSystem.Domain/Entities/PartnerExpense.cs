using System;
using TouristSystem.Domain.Common;
using TouristSystem.Domain.Enums;

namespace TouristSystem.Domain.Entities;

/// <summary>
/// A business expense entered by a partner (hotel/restaurant/transport owner or guide).
/// Used to calculate profit / loss in the Partner Portal finance reports.
/// </summary>
public class PartnerExpense : AuditableEntity
{
    public Guid PartnerId { get; set; }
    public ExpenseCategory Category { get; set; } = ExpenseCategory.Other;
    public decimal Amount { get; set; }
    public DateOnly ExpenseDate { get; set; }
    public string? Description { get; set; }
    public BookingType? ListingType { get; set; }
    public Guid? ListingId { get; set; }
    public string? ReceiptUrl { get; set; }
    public bool IsRecurring { get; set; } = false;

    // Navigation properties
    public User Partner { get; set; } = null!;
}
