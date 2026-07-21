using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TouristSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPassengerTransportProviderModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "transport_companies",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    operating_cities = table.Column<string>(type: "text", nullable: false),
                    is_approved = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    is_system_default = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
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
                    table.PrimaryKey("PK_transport_companies", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "transport_provider_profiles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    company_id = table.Column<Guid>(type: "uuid", nullable: true),
                    custom_company_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    employment_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    years_with_company = table.Column<int>(type: "integer", nullable: false),
                    full_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    date_of_birth = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    age = table.Column<int>(type: "integer", nullable: false),
                    gender = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    nationality = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    current_city = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    current_address = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    profile_photo_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    years_driving_experience = table.Column<int>(type: "integer", nullable: false),
                    is_professional_driver = table.Column<bool>(type: "boolean", nullable: false),
                    previous_company = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    license_number = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    license_category = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    license_issue_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    license_expiration_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    license_front_photo_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    license_back_photo_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    emergency_contact_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    emergency_contact_phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    application_status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    driver_status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    rating_average = table.Column<decimal>(type: "numeric(3,2)", precision: 3, scale: 2, nullable: false),
                    completed_trips_count = table.Column<int>(type: "integer", nullable: false),
                    is_identity_verified = table.Column<bool>(type: "boolean", nullable: false),
                    is_license_verified = table.Column<bool>(type: "boolean", nullable: false),
                    is_vehicle_verified = table.Column<bool>(type: "boolean", nullable: false),
                    is_insurance_verified = table.Column<bool>(type: "boolean", nullable: false),
                    is_company_verified = table.Column<bool>(type: "boolean", nullable: false),
                    rejection_reason = table.Column<string>(type: "text", nullable: true),
                    admin_internal_notes = table.Column<string>(type: "text", nullable: true),
                    submitted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    reviewed_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
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
                    table.PrimaryKey("PK_transport_provider_profiles", x => x.id);
                    table.ForeignKey(
                        name: "FK_transport_provider_profiles_transport_companies_company_id",
                        column: x => x.company_id,
                        principalTable: "transport_companies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_transport_provider_profiles_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "provider_documents",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    provider_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    document_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    file_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    file_name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    file_extension = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    file_size_bytes = table.Column<long>(type: "bigint", nullable: false),
                    mime_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    is_verified = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
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
                    table.PrimaryKey("PK_provider_documents", x => x.id);
                    table.ForeignKey(
                        name: "FK_provider_documents_transport_provider_profiles_provider_pro~",
                        column: x => x.provider_profile_id,
                        principalTable: "transport_provider_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "provider_services",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    provider_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    service_types = table.Column<string>(type: "text", nullable: false),
                    available_cities = table.Column<string>(type: "text", nullable: false),
                    languages_spoken = table.Column<string>(type: "text", nullable: false),
                    payment_methods = table.Column<string>(type: "text", nullable: false),
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
                    table.PrimaryKey("PK_provider_services", x => x.id);
                    table.ForeignKey(
                        name: "FK_provider_services_transport_provider_profiles_provider_prof~",
                        column: x => x.provider_profile_id,
                        principalTable: "transport_provider_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "provider_vehicles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    provider_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    registration_number = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    brand = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    model = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    manufacturing_year = table.Column<int>(type: "integer", nullable: false),
                    color = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    passenger_seats = table.Column<int>(type: "integer", nullable: false),
                    has_air_conditioning = table.Column<bool>(type: "boolean", nullable: false),
                    has_wifi = table.Column<bool>(type: "boolean", nullable: false),
                    has_luggage_space = table.Column<bool>(type: "boolean", nullable: false),
                    child_seat_available = table.Column<bool>(type: "boolean", nullable: false),
                    wheelchair_accessible = table.Column<bool>(type: "boolean", nullable: false),
                    pet_friendly = table.Column<bool>(type: "boolean", nullable: false),
                    smoking_allowed = table.Column<bool>(type: "boolean", nullable: false),
                    registration_certificate_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    insurance_certificate_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    technical_inspection_certificate_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
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
                    table.PrimaryKey("PK_provider_vehicles", x => x.id);
                    table.ForeignKey(
                        name: "FK_provider_vehicles_transport_provider_profiles_provider_prof~",
                        column: x => x.provider_profile_id,
                        principalTable: "transport_provider_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "provider_working_hours",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    provider_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    day_of_week = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    start_time = table.Column<TimeSpan>(type: "interval", nullable: false),
                    end_time = table.Column<TimeSpan>(type: "interval", nullable: false),
                    is_24_hours = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
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
                    table.PrimaryKey("PK_provider_working_hours", x => x.id);
                    table.ForeignKey(
                        name: "FK_provider_working_hours_transport_provider_profiles_provider~",
                        column: x => x.provider_profile_id,
                        principalTable: "transport_provider_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "vehicle_photos",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    vehicle_id = table.Column<Guid>(type: "uuid", nullable: false),
                    photo_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    is_primary = table.Column<bool>(type: "boolean", nullable: false),
                    display_order = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("PK_vehicle_photos", x => x.id);
                    table.ForeignKey(
                        name: "FK_vehicle_photos_provider_vehicles_vehicle_id",
                        column: x => x.vehicle_id,
                        principalTable: "provider_vehicles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_provider_documents_provider_profile_id",
                table: "provider_documents",
                column: "provider_profile_id");

            migrationBuilder.CreateIndex(
                name: "IX_provider_services_provider_profile_id",
                table: "provider_services",
                column: "provider_profile_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_provider_vehicles_provider_profile_id",
                table: "provider_vehicles",
                column: "provider_profile_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_provider_working_hours_provider_profile_id",
                table: "provider_working_hours",
                column: "provider_profile_id");

            migrationBuilder.CreateIndex(
                name: "IX_transport_provider_profiles_company_id",
                table: "transport_provider_profiles",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_transport_provider_profiles_user_id",
                table: "transport_provider_profiles",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_vehicle_photos_vehicle_id",
                table: "vehicle_photos",
                column: "vehicle_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "provider_documents");

            migrationBuilder.DropTable(
                name: "provider_services");

            migrationBuilder.DropTable(
                name: "provider_working_hours");

            migrationBuilder.DropTable(
                name: "vehicle_photos");

            migrationBuilder.DropTable(
                name: "provider_vehicles");

            migrationBuilder.DropTable(
                name: "transport_provider_profiles");

            migrationBuilder.DropTable(
                name: "transport_companies");
        }
    }
}
