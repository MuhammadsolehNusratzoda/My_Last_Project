using System.Collections.Generic;
using TouristSystem.Domain.Entities;
using TouristSystem.Domain.Enums;

namespace TouristSystem.Infrastructure.Data.Seed;

public static partial class DatabaseSeeder
{
    /// <summary>
    /// Additional real tourist places across major Tajik cities, supplementing the core seed list.
    /// </summary>
    private static List<Place> GetExtraPlaces()
    {
        return new List<Place>
        {
            // ---------- Panjakent ----------
            new Place
            {
                Name = "Ancient Town of Panjakent",
                Slug = "ancient-town-of-panjakent",
                Description = "Sprawling 5th-8th century ruins of the pre-Islamic Sogdian capital, abandoned after the Arab conquest and never rebuilt, so its streets, temples, and merchant houses remain traceable underfoot. The site yielded spectacular wall paintings now split between the Hermitage and Dushanbe's National Museum of Antiquities.",
                City = "Panjakent",
                Address = "Devashtich Street, southeastern outskirts of Panjakent",
                Latitude = 39.4881m,
                Longitude = 67.6161m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/f/fa/Penjikent_in_Tajikistan.jpg",
                EntryFee = 3.00m,
                RatingAverage = 4.5m,
                ReviewsCount = 145,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },
            new Place
            {
                Name = "Sarazm Archaeological Site",
                Slug = "sarazm-archaeological-site",
                Description = "A UNESCO World Heritage proto-urban settlement dating back roughly 5,500 years, Sarazm was one of Central Asia's earliest cities, revealing advanced metallurgy, irrigation, and trade links stretching toward the Indus Valley.",
                City = "Panjakent",
                Address = "Sohibnazar village, Panjakent District (15 km west of Panjakent)",
                Latitude = 39.5083m,
                Longitude = 67.4611m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/a/aa/Sarazm%2Carea12-N.jpg",
                EntryFee = 2.00m,
                RatingAverage = 4.3m,
                ReviewsCount = 58,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },
            new Place
            {
                Name = "Rudaki Republican Museum of Regional History",
                Slug = "rudaki-museum-panjakent",
                Description = "Panjakent's principal museum holds more than 98,000 artifacts spanning the Bronze Age through the Sogdian era, including reproductions of the famous frescoes recovered from the ancient city ruins, plus natural-history exhibits of the Zeravshan Valley.",
                City = "Panjakent",
                Address = "Rudaki Street, central Panjakent",
                Latitude = 39.4958m,
                Longitude = 67.6079m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/a/ab/Panjakent%2CRudakiMuseum.jpg",
                EntryFee = 1.50m,
                RatingAverage = 4.2m,
                ReviewsCount = 41,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },
            new Place
            {
                Name = "Rudaki Mausoleum",
                Slug = "rudaki-mausoleum-panjrud",
                Description = "A polygonal red-brick mausoleum crowned with a blue-tiled dome, built in 1958 over the excavated grave of poet Rudaki in his home village of Panjrud. Blind in his final years, Rudaki died here in 941 after a celebrated career at the Samanid court.",
                City = "Panjakent",
                Address = "Panjrud village, Panjakent District",
                Latitude = 39.3550m,
                Longitude = 68.0500m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/b/b5/Rudaki_Tomb_in_Panjkent-after_restored.jpg",
                EntryFee = 0.00m,
                RatingAverage = 4.6m,
                ReviewsCount = 33,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },
            new Place
            {
                Name = "Panjakent Bazaar",
                Slug = "panjakent-bazaar",
                Description = "A lively, distinctly circular covered market held up by white columns at the heart of town, where locals trade meat, dairy, dried fruit, spices, and fresh Zeravshan Valley produce much as they have for generations.",
                City = "Panjakent",
                Address = "Rudaki Avenue, central Panjakent",
                Latitude = 39.4945m,
                Longitude = 67.6090m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/8/8b/Pendzhikent_Market%2C_Tajikistan_%28494465%29.jpg",
                EntryFee = 0.00m,
                RatingAverage = 4.4m,
                ReviewsCount = 76,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },
            new Place
            {
                Name = "Kulikalon Lakes",
                Slug = "kulikalon-lakes",
                Description = "A trio of turquoise glacial lakes cradled beneath sheer granite walls in the Fann Mountains, reached via the alpine village of Artuch. Second in size only to Iskanderkul among the Fann Mountains' lakes, it is a magnet for trekkers and climbers.",
                City = "Panjakent",
                Address = "Artuch Valley, Fann Mountains, Panjakent District",
                Latitude = 39.2569m,
                Longitude = 68.1636m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/b/bb/Kulikalon_Lake_and_Fann_Mountains%2C_Tajikistan.jpg",
                EntryFee = 0.00m,
                RatingAverage = 4.8m,
                ReviewsCount = 94,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },

            // ---------- Khujand ----------
            new Place
            {
                Name = "Sheikh Muslihiddin Mosque and Mausoleum",
                Slug = "sheikh-muslihiddin-mosque-and-mausoleum",
                Description = "This domed 16th-century mosque-mausoleum complex in central Khujand honors Muslihiddin Khujandi, a 12th-century poet, Sufi teacher and ruler revered as a local saint. It includes a mosque with carved wooden columns and a 19th-century 20-meter minaret.",
                City = "Khujand",
                Address = "Central Khujand, near Panjshanbe Bazaar square, Khujand",
                Latitude = 40.2839m,
                Longitude = 69.6219m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/f/fc/%D0%9C%D0%B5%D1%87%D0%B5%D1%82%D1%8C_%D0%B8_%D0%B3%D0%BE%D0%BB%D1%83%D0%B1%D0%B8_3.JPG",
                EntryFee = 0.00m,
                RatingAverage = 4.6m,
                ReviewsCount = 87,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },
            new Place
            {
                Name = "Khujand Fortress",
                Slug = "khujand-fortress",
                Description = "Also known as the Citadel of Kurush-Shah, this fortification traces its origins back more than 2,500 years to the era of Alexander the Great's Alexandria Eschate. The restored walls and towers overlook the Syr Darya river.",
                City = "Khujand",
                Address = "Ismoil Somoni Avenue, near the Syr Darya embankment, Khujand",
                Latitude = 40.2852m,
                Longitude = 69.6182m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/5/5e/Remains_of_the_Khujand_Fortress.jpg",
                EntryFee = 0.00m,
                RatingAverage = 4.5m,
                ReviewsCount = 112,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },
            new Place
            {
                Name = "Historical Museum of Sughd",
                Slug = "historical-museum-of-sughd",
                Description = "Founded in 1986 to mark Khujand's 2,500th anniversary, this is one of Tajikistan's largest museums, housing over 15,000 artifacts within the reconstructed fortress walls, including marble mosaics of Alexander the Great's campaigns.",
                City = "Khujand",
                Address = "Khujand Fortress complex, Ismoil Somoni Avenue, Khujand",
                Latitude = 40.2852m,
                Longitude = 69.6180m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/3/37/Historical_Museum_of_Sughd.jpg",
                EntryFee = 2.00m,
                RatingAverage = 4.4m,
                ReviewsCount = 76,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },
            new Place
            {
                Name = "Kamoli Khujandi Literary Museum",
                Slug = "kamoli-khujandi-literary-museum",
                Description = "Set inside Kamoli Khujandi Park on the southern bank of the Syr Darya, this museum is dedicated to the life and works of the 14th-century Persian poet Kamol Khujandi, linked to the opposite bank by Khujand's cable car.",
                City = "Khujand",
                Address = "Kamoli Khujandi Park, south bank of Syr Darya, Khujand",
                Latitude = 40.2877m,
                Longitude = 69.6136m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/8/87/Kamoli_Khujandi_Museum%2C_Khujand.jpg",
                EntryFee = 1.00m,
                RatingAverage = 4.3m,
                ReviewsCount = 34,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },
            new Place
            {
                Name = "Kamol Khujandi Monument",
                Slug = "kamol-khujandi-monument",
                Description = "Erected in 1996 by sculptor K. Nadirov, this seated bronze statue of the beloved poet Kamol Khujandi is the centerpiece of Kamoli Khujandi Park, one of the city's most photographed tributes to Tajik literary heritage.",
                City = "Khujand",
                Address = "Kamoli Khujandi Park, Khujand",
                Latitude = 40.2875m,
                Longitude = 69.6130m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/5/59/Kamol_Khujandi_monument_in_Khujand.jpg",
                EntryFee = 0.00m,
                RatingAverage = 4.5m,
                ReviewsCount = 29,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },
            new Place
            {
                Name = "Alexandria Eschate Ancient City Walls",
                Slug = "alexandria-eschate-ancient-city-walls",
                Description = "These reconstructed ramparts mark the site of Alexandria Eschate (\"Alexandria the Farthest\"), the fortified city founded by Alexander the Great in 329 BC at what is now Khujand, a striking reminder of the city's ancient Silk Road origins.",
                City = "Khujand",
                Address = "Khujand Fortress grounds, Khujand",
                Latitude = 40.2848m,
                Longitude = 69.6188m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/f/f5/Alexander_the_Great_city_in_Khujand%2C_Tajikistan.jpg",
                EntryFee = 0.00m,
                RatingAverage = 4.2m,
                ReviewsCount = 25,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },

            // ---------- Khorog ----------
            new Place
            {
                Name = "Ismaili Centre Khorog",
                Slug = "ismaili-centre-khorog",
                Description = "A striking community and cultural centre on the bank of the Gunt River, opened in December 2018 and funded by the Aga Khan Foundation. Its design blends Pamiri-house motifs with modern glass and timber architecture.",
                City = "Khorog",
                Address = "Gunt River embankment, Khorog",
                Latitude = 37.4933m,
                Longitude = 71.5540m,
                ImageUrl = "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=800&q=80",
                EntryFee = 0.00m,
                RatingAverage = 4.6m,
                ReviewsCount = 85,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },
            new Place
            {
                Name = "Khorog City Park",
                Slug = "khorog-city-park",
                Description = "A shaded riverside park on the north bank of the Gunt River, lined with tall poplar trees and renovated by the Aga Khan Trust for Culture in 2009. Paved walkways, fountains, and an open-air theatre make it the social heart of the city.",
                City = "Khorog",
                Address = "Davronov Street, Khorog",
                Latitude = 37.4935m,
                Longitude = 71.5525m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/5/54/Poplars_of_Khorog_City_Park.JPG",
                EntryFee = 0.00m,
                RatingAverage = 4.5m,
                ReviewsCount = 110,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },
            new Place
            {
                Name = "World War II Memorial, Khorog",
                Slug = "world-war-ii-memorial-khorog",
                Description = "A Soviet-era memorial complex on Lenin Street depicting a soldier in heroic pose atop a snow-cap-shaped plinth, with plaques listing local soldiers killed in 1941-1945.",
                City = "Khorog",
                Address = "Lenin Street, Khorog",
                Latitude = 37.4908m,
                Longitude = 71.5369m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/9/96/World_War_2_Memorial%2C_Khorog_-_panoramio.jpg",
                EntryFee = 0.00m,
                RatingAverage = 4.3m,
                ReviewsCount = 45,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },
            new Place
            {
                Name = "Khorog Regional Museum",
                Slug = "khorog-regional-museum",
                Description = "Housed in a Soviet-era theatre building, this is the largest museum in Gorno-Badakhshan, displaying Pamiri textiles and traditional dress, regional geology and mineral samples, and artifacts from the Soviet period.",
                City = "Khorog",
                Address = "near Lenin Street, Khorog",
                Latitude = 37.4930m,
                Longitude = 71.5510m,
                ImageUrl = "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80",
                EntryFee = 2.00m,
                RatingAverage = 4.2m,
                ReviewsCount = 38,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },
            new Place
            {
                Name = "Khorog Bazaar",
                Slug = "khorog-bazaar",
                Description = "The bustling central market just west of downtown on Lenin Street, offering fresh produce, dried fruits and nuts, herbs and spices. On Saturdays it links to a unique cross-border market where Afghan traders cross the Tem bridge to sell goods.",
                City = "Khorog",
                Address = "Lenin Street, Khorog",
                Latitude = 37.4951m,
                Longitude = 71.5479m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/c/c2/Khorog_market_%281%29_%2831531861516%29.jpg",
                EntryFee = 0.00m,
                RatingAverage = 4.4m,
                ReviewsCount = 76,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },
            new Place
            {
                Name = "Ismail Somoni Statue, Khorog",
                Slug = "ismail-somoni-statue-khorog",
                Description = "A bronze statue of Ismail Somoni, the 9th-10th century founder-figure of the Tajik nation, set in a small park near Khorog State University. The dramatic granite plinth frames the statue against the surrounding Pamir peaks.",
                City = "Khorog",
                Address = "Lenin Street, near Khorog State University, Khorog",
                Latitude = 37.4940m,
                Longitude = 71.5495m,
                ImageUrl = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
                EntryFee = 0.00m,
                RatingAverage = 4.1m,
                ReviewsCount = 24,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            }
        };
    }
}
