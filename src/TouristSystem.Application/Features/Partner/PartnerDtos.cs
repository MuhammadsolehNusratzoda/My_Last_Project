using System;
using System.Collections.Generic;

namespace TouristSystem.Application.Features.Partner;

/// <summary>KPI block for the partner dashboard.</summary>
public record PartnerSummaryDto(
    int PendingCount,
    int ConfirmedCount,
    int CompletedLast30Days,
    int CancelledLast30Days,
    int ListingsCount,
    IReadOnlyList<PartnerArrivalDto> TodayArrivals,
    DateTime GeneratedAtUtc);

/// <summary>A confirmed booking that starts today (check-in / trip / tour).</summary>
public record PartnerArrivalDto(
    Guid BookingId,
    string TravelerName,
    string? TravelerPhone,
    string ListingName,
    string BookingType,
    DateTime StartDate,
    DateTime EndDate,
    int GuestsCount,
    int Quantity);

/// <summary>One row of the partner bookings table.</summary>
public record PartnerBookingListItemDto(
    Guid Id,
    string BookingType,
    Guid ReferenceId,
    string ListingName,
    string TravelerName,
    string TravelerEmail,
    string? TravelerPhone,
    DateTime StartDate,
    DateTime EndDate,
    int Nights,
    int GuestsCount,
    int Quantity,
    decimal TotalPrice,
    string Status,
    bool IsNoShow,
    DateTime CreatedAt);

/// <summary>Full booking details for the side drawer.</summary>
public record PartnerBookingDetailDto(
    Guid Id,
    string BookingType,
    Guid ReferenceId,
    string ListingName,
    string? ListingCity,
    string TravelerName,
    string TravelerEmail,
    string? TravelerPhone,
    DateTime StartDate,
    DateTime EndDate,
    int Nights,
    int GuestsCount,
    int Quantity,
    decimal TotalPrice,
    string Status,
    string? Notes,
    string? RejectionReason,
    bool IsNoShow,
    DateTime CreatedAt,
    DateTime? ConfirmedAt,
    DateTime? CancelledAt,
    DateTime? CompletedAt,
    IReadOnlyList<BookingHistoryItemDto> History);

public record BookingHistoryItemDto(
    string FromStatus,
    string ToStatus,
    string ChangedBy,
    string? Reason,
    DateTime ChangedAt);

/// <summary>A listing owned by the partner (hotel, restaurant, transport route or guide profile).</summary>
public record PartnerListingDto(
    Guid Id,
    string Type,
    string Name,
    string? City,
    string Status,
    string? ImageUrl,
    decimal? Price,
    string? PriceUnit,
    int? Capacity,
    int? Available,
    decimal RatingAverage,
    DateTime CreatedAt);
