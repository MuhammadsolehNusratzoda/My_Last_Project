using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TouristSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPartnerPortal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "completed_at",
                table: "bookings",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_no_show",
                table: "bookings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "partner_id",
                table: "bookings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "rejection_reason",
                table: "bookings",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "booking_status_history",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    booking_id = table.Column<Guid>(type: "uuid", nullable: false),
                    from_status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    to_status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    changed_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    changed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_booking_status_history", x => x.id);
                    table.ForeignKey(
                        name: "FK_booking_status_history_bookings_booking_id",
                        column: x => x.booking_id,
                        principalTable: "bookings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "partner_expenses",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    partner_id = table.Column<Guid>(type: "uuid", nullable: false),
                    category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    amount = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    expense_date = table.Column<DateOnly>(type: "date", nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    listing_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    listing_id = table.Column<Guid>(type: "uuid", nullable: true),
                    receipt_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_recurring = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_partner_expenses", x => x.id);
                    table.CheckConstraint("CK_PartnerExpenses_Amount", "amount > 0");
                    table.ForeignKey(
                        name: "FK_partner_expenses_users_partner_id",
                        column: x => x.partner_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "idx_bookings_partner_start",
                table: "bookings",
                columns: new[] { "partner_id", "start_date" });

            migrationBuilder.CreateIndex(
                name: "idx_bookings_partner_status",
                table: "bookings",
                columns: new[] { "partner_id", "status" });

            migrationBuilder.CreateIndex(
                name: "idx_booking_status_history_booking",
                table: "booking_status_history",
                columns: new[] { "booking_id", "changed_at" });

            migrationBuilder.CreateIndex(
                name: "idx_partner_expenses_partner_date",
                table: "partner_expenses",
                columns: new[] { "partner_id", "expense_date" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "booking_status_history");

            migrationBuilder.DropTable(
                name: "partner_expenses");

            migrationBuilder.DropIndex(
                name: "idx_bookings_partner_start",
                table: "bookings");

            migrationBuilder.DropIndex(
                name: "idx_bookings_partner_status",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "completed_at",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "is_no_show",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "partner_id",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "rejection_reason",
                table: "bookings");
        }
    }
}
