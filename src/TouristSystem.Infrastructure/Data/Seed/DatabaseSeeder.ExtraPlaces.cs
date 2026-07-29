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
                Description = "Sprawling 5th-8th century ruins of the pre-Islamic Sogdian capital, abandoned after the Arab conquest and never rebuilt, so its streets, temples, and merchant houses remain traceable underfoot.",
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
                Description = "A UNESCO World Heritage proto-urban settlement dating back roughly 5,500 years, Sarazm was one of Central Asia's earliest cities, revealing advanced metallurgy, irrigation, and trade links.",
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
                Description = "Panjakent's principal museum holds more than 98,000 artifacts spanning the Bronze Age through the Sogdian era, including reproductions of the famous frescoes recovered from the ancient city ruins.",
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
                Description = "A polygonal red-brick mausoleum crowned with a blue-tiled dome, built in 1958 over the excavated grave of poet Rudaki in his home village of Panjrud.",
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

            // ---------- Khujand ----------
            new Place
            {
                Name = "Sheikh Muslihiddin Mosque and Mausoleum",
                Slug = "sheikh-muslihiddin-mosque-and-mausoleum",
                Description = "This domed 16th-century mosque-mausoleum complex in central Khujand honors Muslihiddin Khujandi, a 12th-century poet, Sufi teacher and ruler revered as a local saint.",
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
                Description = "Also known as the Citadel of Kurush-Shah, this fortification traces its origins back more than 2,500 years to the era of Alexander the Great's Alexandria Eschate.",
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
                Description = "Founded in 1986 to mark Khujand's 2,500th anniversary, this is one of Tajikistan's largest museums, housing over 15,000 artifacts within the reconstructed fortress walls.",
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
                Description = "Set inside Kamoli Khujandi Park on the southern bank of the Syr Darya, this museum is dedicated to the life and works of the 14th-century Persian poet Kamol Khujandi.",
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
                Name = "Arbob Palace",
                Slug = "arbob-palace",
                Description = "A magnificent cultural palace built in the 1950s modeled after the St. Petersburg Peterhof palace, featuring spectacular fountains, beautiful gardens, and hand-painted wooden ceilings. It is historically significant as the site where the independence of Tajikistan was declared.",
                City = "Khujand",
                Address = "Arbob Hill, Ghafurov District, near Khujand",
                Latitude = 40.2692m,
                Longitude = 69.6917m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/f/f1/%D0%94%D0%B2%D0%BE%D1%80%D0%B5%D1%86_%D0%90%D1%80%D0%B1%D0%BE%D0%B1%2C_%D0%A1%D0%BE%D0%B3%D0%B4%D0%B8%D0%B9%D1%81%D0%BA%D0%B0%D1%8F_%D0%BE%D0%B1%D0%BB..JPG",
                EntryFee = 1.50m,
                RatingAverage = 4.8m,
                ReviewsCount = 145,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },

            // ---------- Khorog ----------
            new Place
            {
                Name = "Ismaili Centre Khorog",
                Slug = "ismaili-centre-khorog",
                Description = "A striking community and cultural centre on the bank of the Gunt River, opened in December 2018. Its design blends Pamiri-house motifs with modern glass and timber architecture.",
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
                Description = "A shaded riverside park on the north bank of the Gunt River, lined with tall poplar trees. Paved walkways, fountains, and an open-air theatre make it the social heart of the city.",
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
                Description = "A Soviet-era memorial complex depicting a soldier in heroic pose atop a snow-cap-shaped plinth, with plaques listing local soldiers killed in 1941-1945.",
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
                Description = "Housed in a Soviet-era theatre building, this museum displays Pamiri textiles, traditional dress, regional geology, mineral samples, and artifacts from the Soviet period.",
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
                Description = "The bustling central market just west of downtown on Lenin Street, offering fresh produce, dried fruits, nuts, herbs, and spices.",
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

            // ---------- Dushanbe ----------
            new Place
            {
                Name = "National Museum of Tajikistan",
                Slug = "national-museum-of-tajikistan",
                Description = "A modern museum housing over 22,000 exhibits showcasing the history, culture, and nature of Tajikistan, featuring a replica of the giant sleeping Buddha.",
                City = "Dushanbe",
                Address = "Ismoil Somoni Avenue 11, Dushanbe",
                Latitude = 38.5815m,
                Longitude = 68.7801m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/b/b3/Dushanbe_National_Museum.jpg",
                EntryFee = 5.00m,
                RatingAverage = 4.7m,
                ReviewsCount = 92,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },
            new Place
            {
                Name = "Rudaki Park",
                Slug = "rudaki-park-dushanbe",
                Description = "A lush, beautifully landscaped green park in central Dushanbe featuring fountains, walking paths, and the iconic statue of the classical Persian poet Rudaki under a golden canopy.",
                City = "Dushanbe",
                Address = "Rudaki Avenue, Dushanbe",
                Latitude = 38.5790m,
                Longitude = 68.7835m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/e/eb/Rudaki_Park%2C_Dushanbe.jpg",
                EntryFee = 0.00m,
                RatingAverage = 4.8m,
                ReviewsCount = 105,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },
            new Place
            {
                Name = "Victory Park",
                Slug = "victory-park-dushanbe",
                Description = "Located on a hill offering panoramic views of Dushanbe, this park features a memorial to the Great Patriotic War with an eternal flame and steps leading to a grand monument.",
                City = "Dushanbe",
                Address = "Victory Park, Dushanbe",
                Latitude = 38.5885m,
                Longitude = 68.8055m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/c/cc/Victory_Park_Dushanbe.jpg",
                EntryFee = 0.00m,
                RatingAverage = 4.4m,
                ReviewsCount = 68,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },
            new Place
            {
                Name = "Mehrgon Bazaar",
                Slug = "mehrgon-bazaar",
                Description = "A grand indoor bazaar built with classical Tajik architectural elements, high columns, and a glass dome, offering a colorful display of fresh fruits, nuts, flatbreads, and traditional sweets.",
                City = "Dushanbe",
                Address = "Mehran Street, Dushanbe",
                Latitude = 38.5992m,
                Longitude = 68.7990m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/a/af/Mehrgon_Bazaar_Dushanbe.jpg",
                EntryFee = 0.00m,
                RatingAverage = 4.6m,
                ReviewsCount = 84,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },
            new Place
            {
                Name = "Ismoil Somoni Monument",
                Slug = "ismoil-somoni-monument-dushanbe",
                Description = "A majestic 13-meter bronze statue of Ismoil Somoni, the founder of the 10th-century Samanid dynasty, set under an impressive 40-meter golden arch in Dousti Square.",
                City = "Dushanbe",
                Address = "Dousti Square, Dushanbe",
                Latitude = 38.5739m,
                Longitude = 68.7875m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/e/ea/Ismail_Somoni_Monument_Dushanbe.jpg",
                EntryFee = 0.00m,
                RatingAverage = 4.9m,
                ReviewsCount = 195,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },

            // ---------- Hisor ----------
            new Place
            {
                Name = "Old Madrasa (Madrasai Kuhna)",
                Slug = "old-madrasa-hisor",
                Description = "A historic 16th-century religious school located opposite the fortress, featuring brick archways, a central courtyard, and cells which now host the local museum.",
                City = "Hisor",
                Address = "Historical Reserve, Hisor",
                Latitude = 38.5265m,
                Longitude = 68.5530m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/0/07/Hisor_Madrasa_Tajikistan.jpg",
                EntryFee = 1.00m,
                RatingAverage = 4.6m,
                ReviewsCount = 47,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },
            new Place
            {
                Name = "Mausoleum of Makhdumi Azam",
                Slug = "mausoleum-of-makhdumi-azam",
                Description = "A sacred 16th-century mausoleum dedicated to the Sufi teacher Makhdumi Azam, situated next to the fortress and visited by many local pilgrims.",
                City = "Hisor",
                Address = "Historical Reserve, Hisor",
                Latitude = 38.5270m,
                Longitude = 68.5535m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/e/e0/Makhdumi_Azam_Mausoleum_Hissar.jpg",
                EntryFee = 0.00m,
                RatingAverage = 4.5m,
                ReviewsCount = 31,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },
            new Place
            {
                Name = "Caravanserai (Khanga)",
                Slug = "caravanserai-hisor",
                Description = "The remains of a traditional roadside inn where merchants and caravans traveling along the Silk Road stayed, located close to the fortress walls.",
                City = "Hisor",
                Address = "Historical Reserve, Hisor",
                Latitude = 38.5260m,
                Longitude = 68.5520m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/3/3b/Pamir_Mountains%2C_Tajikistan%2C_06-04-2008.jpg",
                EntryFee = 0.00m,
                RatingAverage = 4.2m,
                ReviewsCount = 18,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },
            new Place
            {
                Name = "Historical Museum of Hisor",
                Slug = "historical-museum-of-hisor",
                Description = "A fascinating museum located inside the Old Madrasa displaying archaeological finds from Hisor, including ancient coins, weapons, clothing, and pottery.",
                City = "Hisor",
                Address = "Madrasai Kuhna, Hisor",
                Latitude = 38.5264m,
                Longitude = 68.5528m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/3/39/Hisor_Fortress_%2817230862984%29.jpg",
                EntryFee = 1.00m,
                RatingAverage = 4.5m,
                ReviewsCount = 38,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            },
            new Place
            {
                Name = "Shambari Mineral Springs",
                Slug = "shambari-mineral-springs",
                Description = "A famous health resort located in the scenic hills above Hisor, known for its natural therapeutic mineral waters, spa treatments, and clean mountain air.",
                City = "Hisor",
                Address = "Shambari Village, Hisor District",
                Latitude = 38.6433m,
                Longitude = 68.5333m,
                ImageUrl = "https://upload.wikimedia.org/wikipedia/commons/2/23/Iskander-kul%2C_Tajikistan.JPG",
                EntryFee = 0.00m,
                RatingAverage = 4.3m,
                ReviewsCount = 22,
                Status = EntityStatus.Approved,
                CreatedAt = System.DateTime.UtcNow
            }
        };
    }
}
