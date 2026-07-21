using System;
using System.Collections.Generic;
using System.Linq;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Enums;

namespace TouristSystem.Infrastructure.Data.Seed;

/// <summary>
/// Handles seeding initial reference records and default administrator accounts on system startup.
/// </summary>
public static class DatabaseSeeder
{
    public static void Seed(ApplicationDbContext context)
    {
        // 0. Seed Default Transport Companies
        if (!context.TransportCompanies.Any())
        {
            var defaultCompanies = new List<TransportCompany>
            {
                new TransportCompany { Name = "JURA", OperatingCities = "[\"Dushanbe\",\"Khujand\"]", IsApproved = true, IsSystemDefault = true, CreatedAt = DateTime.UtcNow },
                new TransportCompany { Name = "Maxim", OperatingCities = "[\"Dushanbe\",\"Khujand\"]", IsApproved = true, IsSystemDefault = true, CreatedAt = DateTime.UtcNow },
                new TransportCompany { Name = "Olucha Taxi", OperatingCities = "[\"Dushanbe\"]", IsApproved = true, IsSystemDefault = true, CreatedAt = DateTime.UtcNow },
                new TransportCompany { Name = "Somon Taxi", OperatingCities = "[\"Dushanbe\"]", IsApproved = true, IsSystemDefault = true, CreatedAt = DateTime.UtcNow },
                new TransportCompany { Name = "Express Tajikistan", OperatingCities = "[\"Dushanbe\",\"Khujand\",\"Panjakent\",\"Hisor\",\"Khorog\",\"Kulob\",\"Bokhtar\"]", IsApproved = true, IsSystemDefault = true, CreatedAt = DateTime.UtcNow }
            };
            context.TransportCompanies.AddRange(defaultCompanies);
            context.SaveChanges();
        }

        // 1. Seed Users
        if (!context.Users.Any(u => u.Role == UserRole.SuperAdmin))
        {
            var superAdmin = new User
            {
                FullName = "System Super Administrator",
                Email = "superadmin@touristsystem.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("SuperAdmin2026!"),
                PhoneNumber = "+992900000001",
                Role = UserRole.SuperAdmin,
                IsActive = true,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };
            context.Users.Add(superAdmin);
        }

        var hotelOwner = context.Users.FirstOrDefault(u => u.Email == "hotelowner@touristsystem.com");
        if (hotelOwner == null)
        {
            hotelOwner = new User
            {
                FullName = "Somoni Hotel Group",
                Email = "hotelowner@touristsystem.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                PhoneNumber = "+992900000002",
                Role = UserRole.HotelOwner,
                IsActive = true,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };
            context.Users.Add(hotelOwner);
        }

        var restaurantOwner = context.Users.FirstOrDefault(u => u.Email == "restaurantowner@touristsystem.com");
        if (restaurantOwner == null)
        {
            restaurantOwner = new User
            {
                FullName = "National Cuisine Ltd",
                Email = "restaurantowner@touristsystem.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                PhoneNumber = "+992900000003",
                Role = UserRole.RestaurantOwner,
                IsActive = true,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };
            context.Users.Add(restaurantOwner);
        }

        var guideUser1 = context.Users.FirstOrDefault(u => u.Email == "dilshod@touristsystem.com");
        if (guideUser1 == null)
        {
            guideUser1 = new User
            {
                FullName = "Dilshod Sharipov",
                Email = "dilshod@touristsystem.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                PhoneNumber = "+992900000004",
                Role = UserRole.Guide,
                IsActive = true,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };
            context.Users.Add(guideUser1);
        }

        var guideUser2 = context.Users.FirstOrDefault(u => u.Email == "madina@touristsystem.com");
        if (guideUser2 == null)
        {
            guideUser2 = new User
            {
                FullName = "Madina Karimova",
                Email = "madina@touristsystem.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                PhoneNumber = "+992900000005",
                Role = UserRole.Guide,
                IsActive = true,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };
            context.Users.Add(guideUser2);
        }

        var transportOwner = context.Users.FirstOrDefault(u => u.Email == "transportowner@touristsystem.com");
        if (transportOwner == null)
        {
            transportOwner = new User
            {
                FullName = "Pamir Transit Services",
                Email = "transportowner@touristsystem.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                PhoneNumber = "+992900000006",
                Role = UserRole.TransportOwner,
                IsActive = true,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };
            context.Users.Add(transportOwner);
        }

        var normalTourist = context.Users.FirstOrDefault(u => u.Email == "tourist@touristsystem.com");
        if (normalTourist == null)
        {
            normalTourist = new User
            {
                FullName = "John Doe",
                Email = "tourist@touristsystem.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Tourist2026!"),
                PhoneNumber = "+1234567890",
                Role = UserRole.Tourist,
                IsActive = true,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };
            context.Users.Add(normalTourist);
        }

        context.SaveChanges();

        // Retrieve seeded/created user IDs
        var hotelOwnerId = hotelOwner.Id;
        var restaurantOwnerId = restaurantOwner.Id;
        var guideUser1Id = guideUser1.Id;
        var guideUser2Id = guideUser2.Id;
        var transportOwnerId = transportOwner.Id;

        // 2. Seed Places (Destinations)
        if (!context.Places.Any())
        {
            var places = new List<Place>
            {
                new Place
                {
                    Name = "Kokhi Navruz",
                    Slug = "kokhi-navruz",
                    Description = "A spectacular modern palace featuring exquisite hand-carved wood, detailed plasterwork, and breathtaking design showcasing traditional Tajik craftsmanship.",
                    City = "Dushanbe",
                    Address = "Somoni Avenue 46, Dushanbe",
                    Latitude = 38.5833m,
                    Longitude = 68.7667m,
                    ImageUrl = "https://images.unsplash.com/photo-1588097281266-31018abc3a2e?auto=format&fit=crop&w=800&q=80",
                    EntryFee = 5.00m,
                    RatingAverage = 4.8m,
                    ReviewsCount = 120,
                    Status = EntityStatus.Approved,
                    CreatedAt = DateTime.UtcNow
                },
                new Place
                {
                    Name = "Hisor Fortress",
                    Slug = "hisor-fortress",
                    Description = "An ancient fortress dating back to the 16th century, representing a significant historical landmark near Dushanbe with imposing defensive gates and madrasas.",
                    City = "Hisor",
                    Address = "Hisor District, Hisor",
                    Latitude = 38.5263m,
                    Longitude = 68.5525m,
                    ImageUrl = "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=800&q=80",
                    EntryFee = 3.00m,
                    RatingAverage = 4.6m,
                    ReviewsCount = 85,
                    Status = EntityStatus.Approved,
                    CreatedAt = DateTime.UtcNow
                },
                new Place
                {
                    Name = "Panjshanbe Bazaar",
                    Slug = "panjshanbe-bazaar",
                    Description = "One of the largest covered markets in Central Asia, famous for its grand Soviet-neoclassical structure, vibrant local atmosphere, and endless varieties of fresh fruits, spices, and bread.",
                    City = "Khujand",
                    Address = "Sharq Street, Khujand",
                    Latitude = 40.2858m,
                    Longitude = 69.6272m,
                    ImageUrl = "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80",
                    EntryFee = 0.00m,
                    RatingAverage = 4.7m,
                    ReviewsCount = 94,
                    Status = EntityStatus.Approved,
                    CreatedAt = DateTime.UtcNow
                },
                new Place
                {
                    Name = "Iskanderkul Lake",
                    Slug = "iskanderkul-lake",
                    Description = "A magnificent, fan-shaped glacier lake nestled in the Fann Mountains, named after Alexander the Great. Known for its mesmerizing turquoise color and stunning surrounding peaks.",
                    City = "Panjakent",
                    Address = "Fann Mountains region",
                    Latitude = 39.0833m,
                    Longitude = 68.3667m,
                    ImageUrl = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
                    EntryFee = 2.00m,
                    RatingAverage = 4.9m,
                    ReviewsCount = 150,
                    Status = EntityStatus.Approved,
                    CreatedAt = DateTime.UtcNow
                },
                new Place
                {
                    Name = "Seven Lakes (Haft Kul)",
                    Slug = "seven-lakes",
                    Description = "A cascade of seven brilliant lakes with shifting colors, stepping up a narrow rocky gorge in the Shing Valley of the majestic Fann Mountains.",
                    City = "Panjakent",
                    Address = "Shing Valley, Panjakent",
                    Latitude = 39.1833m,
                    Longitude = 67.8333m,
                    ImageUrl = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80",
                    EntryFee = 2.00m,
                    RatingAverage = 4.9m,
                    ReviewsCount = 65,
                    Status = EntityStatus.Approved,
                    CreatedAt = DateTime.UtcNow
                },
                new Place
                {
                    Name = "Pamir Botanical Garden",
                    Slug = "pamir-botanical-garden",
                    Description = "The highest botanical garden in the former Soviet Union, located in Khorog. It houses a massive variety of mountain flora from around the globe at an elevation of 2,320m.",
                    City = "Khorog",
                    Address = "Khorog, Pamir",
                    Latitude = 37.4950m,
                    Longitude = 71.5583m,
                    ImageUrl = "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80",
                    EntryFee = 1.50m,
                    RatingAverage = 4.5m,
                    ReviewsCount = 42,
                    Status = EntityStatus.Approved,
                    CreatedAt = DateTime.UtcNow
                }
            };
            context.Places.AddRange(places);
        }

        // 3. Seed Hotels
        if (!context.Hotels.Any())
        {
            var hotels = new List<Hotel>
            {
                new Hotel
                {
                    OwnerId = hotelOwnerId,
                    Name = "Dushanbe Serena Hotel",
                    Slug = "dushanbe-serena-hotel",
                    Description = "A 5-star hotel featuring traditional Tajik designs, lush gardens, high-end amenities, and outstanding dining options in the heart of the capital.",
                    City = "Dushanbe",
                    Address = "Rudaki Avenue 14, Dushanbe",
                    Latitude = 38.5658m,
                    Longitude = 68.7983m,
                    PhoneNumber = "+992487014000",
                    WebsiteUrl = "https://www.serenahotels.com/dushanbe",
                    ImageUrl = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
                    PricePerNight = 160.00m,
                    Stars = 5,
                    RatingAverage = 4.8m,
                    ReviewsCount = 88,
                    TotalRooms = 120,
                    AvailableRooms = 45,
                    HasWifi = true,
                    HasParking = true,
                    HasPool = true,
                    HasGym = true,
                    HasRestaurant = true,
                    IsFamilyFriendly = true,
                    IsLuxury = true,
                    IsBudget = false,
                    Status = EntityStatus.Approved,
                    CreatedAt = DateTime.UtcNow
                },
                new Hotel
                {
                    OwnerId = hotelOwnerId,
                    Name = "Khujand Grand Hotel",
                    Slug = "khujand-grand-hotel",
                    Description = "Comfortable 4-star hotel offering magnificent Syr Darya river views, elegant rooms, and top-tier services for both leisure and business travelers.",
                    City = "Khujand",
                    Address = "Rakhmon Nabiev Street 24, Khujand",
                    Latitude = 40.2792m,
                    Longitude = 69.6237m,
                    PhoneNumber = "+992927771234",
                    WebsiteUrl = "http://khujandgrandhotel.tj",
                    ImageUrl = "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
                    PricePerNight = 75.00m,
                    Stars = 4,
                    RatingAverage = 4.4m,
                    ReviewsCount = 52,
                    TotalRooms = 60,
                    AvailableRooms = 28,
                    HasWifi = true,
                    HasParking = true,
                    HasPool = false,
                    HasGym = true,
                    HasRestaurant = true,
                    IsFamilyFriendly = true,
                    IsLuxury = false,
                    IsBudget = false,
                    Status = EntityStatus.Approved,
                    CreatedAt = DateTime.UtcNow
                },
                new Hotel
                {
                    OwnerId = hotelOwnerId,
                    Name = "Pamir Lodge Khorog",
                    Slug = "pamir-lodge-khorog",
                    Description = "The ultimate guesthouse and meeting point for travelers journeying across the Pamir Highway, offering budget rooms, common areas, and a cozy local vibe.",
                    City = "Khorog",
                    Address = "Gagarin Street 48, Khorog",
                    Latitude = 37.4912m,
                    Longitude = 71.5456m,
                    PhoneNumber = "+992935051234",
                    WebsiteUrl = "http://pamirlodge.com",
                    ImageUrl = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
                    PricePerNight = 25.00m,
                    Stars = 2,
                    RatingAverage = 4.5m,
                    ReviewsCount = 110,
                    TotalRooms = 20,
                    AvailableRooms = 8,
                    HasWifi = true,
                    HasParking = true,
                    HasPool = false,
                    HasGym = false,
                    HasRestaurant = true,
                    IsFamilyFriendly = true,
                    IsLuxury = false,
                    IsBudget = true,
                    Status = EntityStatus.Approved,
                    CreatedAt = DateTime.UtcNow
                }
            };
            context.Hotels.AddRange(hotels);
        }

        // 4. Seed Restaurants
        if (!context.Restaurants.Any())
        {
            var restaurants = new List<Restaurant>
            {
                new Restaurant
                {
                    OwnerId = restaurantOwnerId,
                    Name = "Chaykhona Rokhat",
                    Slug = "chaykhona-rokhat",
                    Description = "The legendary open-air teahouse of Dushanbe, famous for its magnificent columns, traditional design, and serving the best Tajik Osh, Sambusa, and tea.",
                    City = "Dushanbe",
                    Address = "Rudaki Avenue 84, Dushanbe",
                    Latitude = 38.5772m,
                    Longitude = 68.7891m,
                    PhoneNumber = "+992372242133",
                    WebsiteUrl = "http://rokhat.tj",
                    ImageUrl = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
                    CuisineType = "National, Uzbek",
                    PriceRange = PriceRange.Medium,
                    OpeningHours = "08:00 - 23:00",
                    RatingAverage = 4.6m,
                    ReviewsCount = 145,
                    HasDelivery = true,
                    HasWifi = true,
                    HasParking = true,
                    Status = EntityStatus.Approved,
                    CreatedAt = DateTime.UtcNow
                },
                new Restaurant
                {
                    OwnerId = restaurantOwnerId,
                    Name = "Bahor Restaurant",
                    Slug = "bahor-restaurant",
                    Description = "Elegant restaurant in Khujand offering a combination of superb European dishes and classic Tajik specialities, perfect for families and events.",
                    City = "Khujand",
                    Address = "Nabiev Street 15, Khujand",
                    Latitude = 40.2805m,
                    Longitude = 69.6201m,
                    PhoneNumber = "+992928881234",
                    WebsiteUrl = "http://bahor.tj",
                    ImageUrl = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
                    CuisineType = "European, National",
                    PriceRange = PriceRange.High,
                    OpeningHours = "11:00 - 23:00",
                    RatingAverage = 4.3m,
                    ReviewsCount = 38,
                    HasDelivery = false,
                    HasWifi = true,
                    HasParking = true,
                    Status = EntityStatus.Approved,
                    CreatedAt = DateTime.UtcNow
                },
                new Restaurant
                {
                    OwnerId = restaurantOwnerId,
                    Name = "Panjakent Osh Center",
                    Slug = "panjakent-osh-center",
                    Description = "Widely regarded as the best local spot for authentic Panjakenti Osh Palov. Prepared fresh daily using locally grown devzira rice and tender yellow carrots.",
                    City = "Panjakent",
                    Address = "Rudaki Avenue 12, Panjakent",
                    Latitude = 39.4950m,
                    Longitude = 67.6083m,
                    PhoneNumber = "+992925555678",
                    WebsiteUrl = null,
                    ImageUrl = "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
                    CuisineType = "National, Osh",
                    PriceRange = PriceRange.Low,
                    OpeningHours = "09:00 - 15:00",
                    RatingAverage = 4.9m,
                    ReviewsCount = 82,
                    HasDelivery = true,
                    HasWifi = false,
                    HasParking = true,
                    Status = EntityStatus.Approved,
                    CreatedAt = DateTime.UtcNow
                }
            };
            context.Restaurants.AddRange(restaurants);
        }

        // 5. Seed Guides
        if (!context.Guides.Any())
        {
            var guides = new List<Guide>
            {
                new Guide
                {
                    UserId = guideUser1Id,
                    Bio = "Experienced guide specializing in cultural and historical tours through Hisor Fortress, Dushanbe city sights, and excursions to Iskanderkul Lake. Speaks English, Russian, and Tajik.",
                    Languages = "English, Russian, Tajik",
                    City = "Dushanbe",
                    PricePerDay = 45.00m,
                    ExperienceYears = 6,
                    RatingAverage = 4.9m,
                    ReviewsCount = 47,
                    ImageUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
                    IsAvailable = true,
                    Status = EntityStatus.Approved,
                    CreatedAt = DateTime.UtcNow
                },
                new Guide
                {
                    UserId = guideUser2Id,
                    Bio = "Professional mountain guide offering trekking and hiking tours through the Fann Mountains, Haft Kul (Seven Lakes), and Panjakent archaeological sites. Speaks Russian and Tajik.",
                    Languages = "Russian, Tajik",
                    City = "Panjakent",
                    PricePerDay = 35.00m,
                    ExperienceYears = 8,
                    RatingAverage = 4.7m,
                    ReviewsCount = 31,
                    ImageUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
                    IsAvailable = true,
                    Status = EntityStatus.Approved,
                    CreatedAt = DateTime.UtcNow
                }
            };
            context.Guides.AddRange(guides);
        }

        // 6. Seed Transports
        if (!context.Transports.Any())
        {
            var transports = new List<Transport>
            {
                new Transport
                {
                    OwnerId = transportOwnerId,
                    Name = "Dushanbe - Khujand Daily Bus",
                    Type = TransportType.Bus,
                    OriginCity = "Dushanbe",
                    DestinationCity = "Khujand",
                    DepartureTime = DateTime.UtcNow.AddDays(1).Date.AddHours(8), // Tomorrow at 8 AM
                    ArrivalTime = DateTime.UtcNow.AddDays(1).Date.AddHours(14),   // Tomorrow at 2 PM
                    PricePerSeat = 15.00m,
                    TotalSeats = 40,
                    AvailableSeats = 38,
                    VehicleNumber = "TJ 0707 AA 01",
                    ContactPhone = "+992900777123",
                    Status = EntityStatus.Approved,
                    CreatedAt = DateTime.UtcNow
                },
                new Transport
                {
                    OwnerId = transportOwnerId,
                    Name = "Dushanbe - Khorog Pamir Van",
                    Type = TransportType.Van,
                    OriginCity = "Dushanbe",
                    DestinationCity = "Khorog",
                    DepartureTime = DateTime.UtcNow.AddDays(2).Date.AddHours(6), // In 2 days at 6 AM
                    ArrivalTime = DateTime.UtcNow.AddDays(2).Date.AddHours(18),  // In 2 days at 6 PM
                    PricePerSeat = 35.00m,
                    TotalSeats = 12,
                    AvailableSeats = 10,
                    VehicleNumber = "TJ 9988 BB 04",
                    ContactPhone = "+992931112233",
                    Status = EntityStatus.Approved,
                    CreatedAt = DateTime.UtcNow
                },
                new Transport
                {
                    OwnerId = transportOwnerId,
                    Name = "Khujand - Panjakent Shared Taxi",
                    Type = TransportType.Taxi,
                    OriginCity = "Khujand",
                    DestinationCity = "Panjakent",
                    DepartureTime = DateTime.UtcNow.AddDays(1).Date.AddHours(9),
                    ArrivalTime = DateTime.UtcNow.AddDays(1).Date.AddHours(13),
                    PricePerSeat = 12.00m,
                    TotalSeats = 4,
                    AvailableSeats = 4,
                    VehicleNumber = "TJ 1234 CC 02",
                    ContactPhone = "+992928889900",
                    Status = EntityStatus.Approved,
                    CreatedAt = DateTime.UtcNow
                }
            };
            context.Transports.AddRange(transports);
        }

        context.SaveChanges();
    }
}
