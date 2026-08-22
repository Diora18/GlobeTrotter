const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const STAY_COST_PER_INDEX = 50;

const cities = [
  // Europe
  { name: 'Paris', country: 'France', region: 'Europe', costIndex: 8, popularity: 98, imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800' },
  { name: 'Rome', country: 'Italy', region: 'Europe', costIndex: 7, popularity: 95, imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800' },
  { name: 'Barcelona', country: 'Spain', region: 'Europe', costIndex: 6, popularity: 92, imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a84ef013?w=800' },
  { name: 'London', country: 'United Kingdom', region: 'Europe', costIndex: 9, popularity: 96, imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800' },
  { name: 'Amsterdam', country: 'Netherlands', region: 'Europe', costIndex: 7, popularity: 90, imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96fd019?w=800' },
  { name: 'Venice', country: 'Italy', region: 'Europe', costIndex: 8, popularity: 89, imageUrl: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=800' },
  { name: 'Florence', country: 'Italy', region: 'Europe', costIndex: 7, popularity: 87, imageUrl: 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=800' },
  { name: 'Berlin', country: 'Germany', region: 'Europe', costIndex: 6, popularity: 86, imageUrl: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800' },
  { name: 'Vienna', country: 'Austria', region: 'Europe', costIndex: 7, popularity: 85, imageUrl: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800' },
  { name: 'Prague', country: 'Czech Republic', region: 'Europe', costIndex: 5, popularity: 88, imageUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800' },

  // Asia
  { name: 'Tokyo', country: 'Japan', region: 'Asia', costIndex: 8, popularity: 97, imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800' },
  { name: 'Kyoto', country: 'Japan', region: 'Asia', costIndex: 7, popularity: 93, imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800' },
  { name: 'Bangkok', country: 'Thailand', region: 'Asia', costIndex: 4, popularity: 91, imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800' },
  { name: 'Singapore', country: 'Singapore', region: 'Asia', costIndex: 8, popularity: 92, imageUrl: 'https://images.unsplash.com/photo-1525621480887-4f8a7e5a7c1b?w=800' },
  { name: 'Seoul', country: 'South Korea', region: 'Asia', costIndex: 7, popularity: 89, imageUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800' },
  { name: 'Bali', country: 'Indonesia', region: 'Asia', costIndex: 4, popularity: 94, imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800' },

  // Americas
  { name: 'New York', country: 'United States', region: 'North America', costIndex: 9, popularity: 99, imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800' },
  { name: 'San Francisco', country: 'United States', region: 'North America', costIndex: 9, popularity: 85, imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800' },
  { name: 'Los Angeles', country: 'United States', region: 'North America', costIndex: 8, popularity: 91, imageUrl: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=800' },
  { name: 'Miami', country: 'United States', region: 'North America', costIndex: 8, popularity: 86, imageUrl: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800' },
  { name: 'Rio de Janeiro', country: 'Brazil', region: 'South America', costIndex: 5, popularity: 84, imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800' },

  // Middle East, Oceania, Africa
  { name: 'Dubai', country: 'United Arab Emirates', region: 'Middle East', costIndex: 8, popularity: 93, imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800' },
  { name: 'Sydney', country: 'Australia', region: 'Oceania', costIndex: 7, popularity: 88, imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800' },
  { name: 'Melbourne', country: 'Australia', region: 'Oceania', costIndex: 7, popularity: 83, imageUrl: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800' },
  { name: 'Cape Town', country: 'South Africa', region: 'Africa', costIndex: 5, popularity: 87, imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800' },
];

const activitiesByCity = {
  Paris: [
    { name: 'Eiffel Tower Summit Access', description: 'Enjoy panoramic views over Paris from the summit of the Eiffel Tower', type: 'sightseeing', estimatedCost: 35, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=600' },
    { name: 'Louvre Museum Guided Tour', description: 'Explore world-famous masterpieces including Mona Lisa & Venus de Milo', type: 'culture', estimatedCost: 25, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600' },
    { name: 'Seine Sunset Dinner Cruise', description: 'Gourmet 3-course French dinner sailing past illuminated Parisian monuments', type: 'food', estimatedCost: 95, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600' },
    { name: 'Montmartre & Sacré-Cœur Walk', description: 'Guided walking tour through historic artists alleyways and Sacré-Cœur', type: 'culture', estimatedCost: 15, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1509299349698-dd22323b5963?w=600' },
    { name: 'Parisian Bakery & Macaron Workshop', description: 'Hands-on workshop making authentic French macarons with a master chef', type: 'food', estimatedCost: 75, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=600' },
  ],
  Rome: [
    { name: 'Colosseum & Roman Forum VIP Access', description: 'Skip-the-line access to the Colosseum arena floor and Palatine Hill', type: 'sightseeing', estimatedCost: 32, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600' },
    { name: 'Vatican Museums & Sistine Chapel', description: 'Guided tour of St. Peter’s Basilica and Michelangelo’s Sistine Chapel ceiling', type: 'culture', estimatedCost: 28, durationMinutes: 210, imageUrl: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=600' },
    { name: 'Trastevere Evening Food & Wine Tour', description: 'Taste artisanal pasta, street food, and wine in historic Trastevere', type: 'food', estimatedCost: 60, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600' },
    { name: 'Pasta & Gelato Making Class', description: 'Learn to make fresh Italian pasta from scratch followed by homemade gelato', type: 'food', estimatedCost: 65, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281292?w=600' },
  ],
  Barcelona: [
    { name: 'Sagrada Família Fast-Track Tour', description: 'Explore Gaudí’s masterpiece cathedral with tower access', type: 'sightseeing', estimatedCost: 30, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a84ef013?w=600' },
    { name: 'Park Güell & Modernism Walk', description: 'Stroll through Gaudí’s colorful ceramic mosaic park overlooking the city', type: 'culture', estimatedCost: 15, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?w=600' },
    { name: 'Gothic Quarter Tapas & Sangria Tasting', description: 'Sample authentic Catalan tapas and local wines across 4 tapas bars', type: 'food', estimatedCost: 50, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=600' },
    { name: 'Barceloneta Beach Sunset Sailing', description: 'Catamaran cruise along Barcelona coastline with drinks and music', type: 'adventure', estimatedCost: 45, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600' },
  ],
  London: [
    { name: 'Tower of London & Crown Jewels', description: 'Explore medieval history and view the royal Crown Jewels collection', type: 'sightseeing', estimatedCost: 35, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600' },
    { name: 'British Museum Masterpieces Tour', description: 'Guided tour of the Rosetta Stone, Egyptian mummies, and Parthenon sculptures', type: 'culture', estimatedCost: 20, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=600' },
    { name: 'London Eye Flight & Champagne', description: 'Ride the iconic giant observation wheel overlooking Big Ben and Parliament', type: 'sightseeing', estimatedCost: 40, durationMinutes: 60, imageUrl: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=600' },
    { name: 'West End Musical Theatre Show', description: 'Watch a top-tier Broadway/West End musical performance in Soho', type: 'culture', estimatedCost: 90, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600' },
  ],
  Amsterdam: [
    { name: 'Rijksmuseum Art Masterpieces', description: 'See Rembrandt’s Night Watch and Vermeer’s Milkmaid in person', type: 'culture', estimatedCost: 25, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1584003564911-a7a321c84e1c?w=600' },
    { name: 'Historic Canal Cruise & Cheese Tasting', description: 'Glide along 17th-century UNESCO canals with Dutch cheeses and wine', type: 'sightseeing', estimatedCost: 25, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96fd019?w=600' },
    { name: 'Anne Frank House Historical Tour', description: 'Explore historic Secret Annex and WWII history exhibition', type: 'culture', estimatedCost: 16, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=600' },
    { name: 'Countryside Windmills & Zaanse Schans Bike Tour', description: 'Cycle past traditional windmills, wooden clog makers, and cheese farms', type: 'adventure', estimatedCost: 40, durationMinutes: 240, imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600' },
  ],
  Venice: [
    { name: 'Grand Canal Gondola Ride', description: 'Classic private gondola ride along scenic Venetian waterways', type: 'sightseeing', estimatedCost: 90, durationMinutes: 45, imageUrl: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=600' },
    { name: 'St. Mark’s Basilica & Doge’s Palace', description: 'Explore Byzantine mosaics and secret palace passageways', type: 'culture', estimatedCost: 35, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?w=600' },
    { name: 'Murano & Burano Glass & Lace Island Tour', description: 'Boat trip to colorful Burano island and live Murano glassblowing demo', type: 'culture', estimatedCost: 30, durationMinutes: 240, imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600' },
  ],
  Florence: [
    { name: 'Uffizi Gallery Renaissance Tour', description: 'View Botticelli’s Birth of Venus and Da Vinci paintings', type: 'culture', estimatedCost: 26, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=600' },
    { name: 'Duomo Dome Climb & Florence Viewpoint', description: 'Climb 463 steps to Brunelleschi’s dome for breathtaking city views', type: 'sightseeing', estimatedCost: 30, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600' },
    { name: 'Tuscan Wine & Olive Oil Tasting Day Trip', description: 'Tour Chianti vineyards with wine tasting and authentic Tuscan lunch', type: 'food', estimatedCost: 85, durationMinutes: 300, imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600' },
  ],
  Berlin: [
    { name: 'Brandenburg Gate & Berlin Wall History Walk', description: 'Discover Cold War history, Checkpoint Charlie, and East Side Gallery', type: 'sightseeing', estimatedCost: 15, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=600' },
    { name: 'Museum Island Culture Pass', description: 'Access 5 world-class museums including the Pergamon & Neues Museum', type: 'culture', estimatedCost: 24, durationMinutes: 240, imageUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600' },
    { name: 'Berlin Craft Beer & Street Food Tour', description: 'Taste local currywurst, craft beers, and multicultural street food', type: 'food', estimatedCost: 45, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1538488881525-4202c4f4208a?w=600' },
  ],
  Tokyo: [
    { name: 'Shibuya Crossing & Harajuku Fashion Walk', description: 'Experience the world’s busiest intersection and vibrant Takeshita street', type: 'sightseeing', estimatedCost: 0, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=600' },
    { name: 'Tsukiji Outer Market Gourmet Food Tour', description: 'Sample fresh sashimi, A5 Wagyu beef, and tamagoyaki', type: 'food', estimatedCost: 55, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600' },
    { name: 'TeamLab Planets Immersive Digital Art', description: 'Walk through water and interactive body-immersive digital art installations', type: 'culture', estimatedCost: 35, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600' },
    { name: 'Mount Fuji & Hakone Scenic Day Trip', description: 'Bullet train journey to Mt. Fuji, Lake Ashi cruise, and Hakone ropeway', type: 'adventure', estimatedCost: 110, durationMinutes: 480, imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600' },
  ],
  Kyoto: [
    { name: 'Fushimi Inari Shrine Thousand Torii Gates', description: 'Hike through thousands of vibrant vermilion Torii gates up Mt. Inari', type: 'sightseeing', estimatedCost: 0, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600' },
    { name: 'Arashiyama Bamboo Grove & Monkey Park', description: 'Stroll through soaring bamboo stalks and visit wild macaque park', type: 'adventure', estimatedCost: 10, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600' },
    { name: 'Traditional Tea Ceremony in Gion', description: 'Experience authentic matcha tea preparation hosted by a Tea Master', type: 'culture', estimatedCost: 40, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600' },
  ],
  Bangkok: [
    { name: 'Grand Palace & Emerald Buddha Temple', description: 'Explore opulent royal palaces and sacred golden stupas', type: 'sightseeing', estimatedCost: 18, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600' },
    { name: 'Damnoen Saduak Floating Market Tour', description: 'Longtail boat ride through lively floating canal markets selling local fruit & food', type: 'food', estimatedCost: 30, durationMinutes: 240, imageUrl: 'https://images.unsplash.com/photo-1563492065-73a5a902da26?w=600' },
    { name: 'Chinatown Night Food Tour by Tuk-Tuk', description: 'Zip around Bangkok by Tuk-Tuk tasting Michelin-recommended street food', type: 'food', estimatedCost: 40, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600' },
  ],
  Singapore: [
    { name: 'Gardens by the Bay & Supertree Observatory', description: 'Walk the OCBC Skyway and visit the Flower Dome & Cloud Forest', type: 'sightseeing', estimatedCost: 32, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1525621480887-4f8a7e5a7c1b?w=600' },
    { name: 'Marina Bay Sands Skypark Observation Deck', description: 'Panoramic 57th-floor skyline views over Singapore harbor', type: 'sightseeing', estimatedCost: 26, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600' },
    { name: 'Lau Pa Sat Hawker Food Feast', description: 'Enjoy chicken rice, satay skewers, and chili crab at historic hawker center', type: 'food', estimatedCost: 25, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600' },
  ],
  Seoul: [
    { name: 'Gyeongbokgung Palace Hanbok Experience', description: 'Rent traditional Korean Hanbok clothing and tour royal Joseon dynasty palace', type: 'culture', estimatedCost: 20, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=600' },
    { name: 'Namsan Seoul Tower Sunset View', description: 'Cable car ride to N Seoul Tower for 360-degree views over Seoul', type: 'sightseeing', estimatedCost: 15, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=600' },
    { name: 'Gwangjang Market K-Food Tour', description: 'Taste bindaetteok (mung bean pancakes), tteokbokki, and fresh Mayak kimbap', type: 'food', estimatedCost: 25, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=600' },
  ],
  Bali: [
    { name: 'Ubud Monkey Forest & Rice Terraces', description: 'Explore Tegalalang terraced rice fields and sacred monkey sanctuary', type: 'adventure', estimatedCost: 15, durationMinutes: 240, imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600' },
    { name: 'Uluwatu Sunset Temple & Kecak Fire Dance', description: 'Watch traditional Kecak cliffside dance at sunset over the Indian Ocean', type: 'culture', estimatedCost: 20, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600' },
    { name: 'Canggu Surf Lesson & Beach Club', description: 'Beginner surfing session followed by relaxing sunset at famous beach clubs', type: 'adventure', estimatedCost: 35, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600' },
  ],
  'New York': [
    { name: 'Statue of Liberty & Ellis Island Ferry', description: 'Ferry to Liberty Island with pedestal access and immigration museum', type: 'sightseeing', estimatedCost: 25, durationMinutes: 210, imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600' },
    { name: 'Summit One Vanderbilt Glass Observation', description: 'Multi-sensory glass skyboxes floating high above Manhattan', type: 'sightseeing', estimatedCost: 42, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600' },
    { name: 'Broadway Show Evening Ticket', description: 'Top Broadway musical performance in Times Square theater district', type: 'culture', estimatedCost: 120, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600' },
    { name: 'High Line & Chelsea Market Food Walk', description: 'Stroll elevated park trail followed by gourmet food hall tastings', type: 'food', estimatedCost: 35, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600' },
  ],
  'San Francisco': [
    { name: 'Golden Gate Bridge Bike Tour & Sausalito', description: 'Cycle across the Golden Gate Bridge and catch Sausalito ferry back', type: 'adventure', estimatedCost: 32, durationMinutes: 240, imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600' },
    { name: 'Alcatraz Island Maximum Security Prison', description: 'Audio-guided tour inside historic Alcatraz cellhouse', type: 'sightseeing', estimatedCost: 45, durationMinutes: 180, imageUrl: 'https://images.unsplash.com/photo-1541464522888-898162c772b8?w=600' },
    { name: 'Fisherman’s Wharf Clam Chowder & Sea Lions', description: 'Visit Pier 39 sea lions and taste sourdough clam chowder bowls', type: 'food', estimatedCost: 20, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?w=600' },
  ],
  Dubai: [
    { name: 'Burj Khalifa 124th & 125th Floor Access', description: 'Ascend the world’s tallest skyscraper for views across Dubai skyline', type: 'sightseeing', estimatedCost: 48, durationMinutes: 90, imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600' },
    { name: 'Red Dune Desert Safari & BBQ Dinner', description: 'Dune bashing 4x4, camel riding, quad biking, and Bedouin camp dinner show', type: 'adventure', estimatedCost: 65, durationMinutes: 360, imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600' },
    { name: 'Dubai Mall & Fountain Show Cruise', description: 'Traditional boat ride on Burj Lake during synchronized musical fountain show', type: 'sightseeing', estimatedCost: 20, durationMinutes: 60, imageUrl: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=600' },
  ],
  Sydney: [
    { name: 'Sydney Opera House Guided Architectural Tour', description: 'Inside tour of world-famous concert halls and sails architecture', type: 'culture', estimatedCost: 30, durationMinutes: 60, imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600' },
    { name: 'Sydney Harbour Sunset Cruise', description: 'Catamaran sailing past Sydney Harbour Bridge and Opera House', type: 'sightseeing', estimatedCost: 55, durationMinutes: 120, imageUrl: 'https://images.unsplash.com/photo-1523428096881-5bd79d04300f?w=600' },
    { name: 'Bondi to Coogee Coastal Walk', description: 'Clifftop ocean walk linking iconic Sydney beaches and ocean pools', type: 'adventure', estimatedCost: 0, durationMinutes: 150, imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600' },
  ],
};

async function findOrCreateCity(cityData) {
  const existing = await prisma.city.findFirst({ where: { name: cityData.name } });
  if (existing) {
    return prisma.city.update({
      where: { id: existing.id },
      data: cityData,
    });
  }
  return prisma.city.create({ data: cityData });
}

async function main() {
  console.log('Seeding database with rich multi-city data & activity photos...');

  for (const cityData of cities) {
    const city = await findOrCreateCity(cityData);

    const cityActivities = activitiesByCity[city.name] || [
      { name: `${city.name} Highlights Sightseeing Tour`, description: `Must-see landmarks and cultural highlights of ${city.name}`, type: 'sightseeing', estimatedCost: 35, durationMinutes: 120, imageUrl: city.imageUrl },
      { name: `${city.name} Authentic Culinary Walk`, description: `Sample local delicacies and food markets in ${city.name}`, type: 'food', estimatedCost: 45, durationMinutes: 150, imageUrl: city.imageUrl },
      { name: `${city.name} Historic Museum & Heritage Pass`, description: `Explore top cultural heritage museums in ${city.name}`, type: 'culture', estimatedCost: 25, durationMinutes: 180, imageUrl: city.imageUrl },
      { name: `${city.name} Outdoor Adventure Experience`, description: `Exciting outdoor excursion around ${city.name}`, type: 'adventure', estimatedCost: 50, durationMinutes: 210, imageUrl: city.imageUrl },
    ];

    for (const activity of cityActivities) {
      const existing = await prisma.activity.findFirst({
        where: { cityId: city.id, name: activity.name },
      });

      if (!existing) {
        await prisma.activity.create({ data: { ...activity, cityId: city.id } });
      } else {
        await prisma.activity.update({
          where: { id: existing.id },
          data: { imageUrl: activity.imageUrl || city.imageUrl },
        });
      }
    }
  }

  const passwordHash = await bcrypt.hash('password123', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@globetrotter.com' },
    update: { name: 'Khush Patel', isAdmin: true },
    create: {
      email: 'demo@globetrotter.com',
      passwordHash,
      name: 'Khush Patel',
      isAdmin: true,
      city: 'New York',
      country: 'United States',
      phoneNumber: '+1 (555) 234-5678',
    },
  });

  const khushUser = await prisma.user.upsert({
    where: { email: 'khushptl173@gmail.com' },
    update: { name: 'Khush Patel', isAdmin: true },
    create: {
      email: 'khushptl173@gmail.com',
      passwordHash,
      name: 'Khush Patel',
      isAdmin: true,
      city: 'San Francisco',
      country: 'United States',
      phoneNumber: '+1 (555) 987-6543',
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@globetrotter.com' },
    update: { isAdmin: true },
    create: {
      email: 'admin@globetrotter.com',
      passwordHash,
      name: 'Platform Administrator',
      isAdmin: true,
    },
  });

  // Seed rich sample trips for users
  const createSampleTrip = async (user, tripConfig) => {
    const existing = await prisma.trip.findFirst({
      where: { userId: user.id, name: tripConfig.name },
    });
    if (existing) return existing;

    const userSlug = `${user.id.slice(0, 6)}-${tripConfig.shareSlug}`;

    const trip = await prisma.trip.create({
      data: {
        userId: user.id,
        name: tripConfig.name,
        startDate: new Date(tripConfig.startDate),
        endDate: new Date(tripConfig.endDate),
        description: tripConfig.description,
        coverPhotoUrl: tripConfig.coverPhotoUrl,
        isPublic: true,
        shareSlug: userSlug,
      },
    });

    for (let i = 0; i < tripConfig.stops.length; i++) {
      const stopConf = tripConfig.stops[i];
      const city = await prisma.city.findFirst({ where: { name: stopConf.cityName } });
      if (!city) continue;

      const stop = await prisma.tripStop.create({
        data: {
          tripId: trip.id,
          cityId: city.id,
          arrivalDate: new Date(stopConf.arrivalDate),
          departureDate: new Date(stopConf.departureDate),
          orderIndex: i,
          estimatedTransportCost: stopConf.transportCost || 100,
          estimatedStayCost: (stopConf.days || 3) * city.costIndex * STAY_COST_PER_INDEX,
        },
      });

      // Add activities
      for (let j = 0; j < (stopConf.activityNames || []).length; j++) {
        const actName = stopConf.activityNames[j];
        const activity = await prisma.activity.findFirst({ where: { cityId: city.id, name: actName } });
        if (activity) {
          const actDate = new Date(stopConf.arrivalDate);
          actDate.setDate(actDate.getDate() + (j % (stopConf.days || 3)));
          await prisma.stopActivity.create({
            data: {
              stopId: stop.id,
              activityId: activity.id,
              scheduledAt: actDate,
              orderIndex: j,
            },
          });
        }
      }
    }
    return trip;
  };

  const sampleTrips = [
    {
      name: 'Grand European Capital Highlights',
      startDate: '2026-10-01',
      endDate: '2026-10-15',
      description: 'Two-week luxury adventure through Paris, Rome, and Barcelona with curated cultural tours.',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
      shareSlug: 'europe-capitals-2026',
      stops: [
        { cityName: 'Paris', arrivalDate: '2026-10-01', departureDate: '2026-10-05', days: 4, transportCost: 150, activityNames: ['Eiffel Tower Summit Access', 'Louvre Museum Guided Tour', 'Seine Sunset Dinner Cruise'] },
        { cityName: 'Rome', arrivalDate: '2026-10-06', departureDate: '2026-10-10', days: 4, transportCost: 90, activityNames: ['Colosseum & Roman Forum VIP Access', 'Vatican Museums & Sistine Chapel', 'Pasta & Gelato Making Class'] },
        { cityName: 'Barcelona', arrivalDate: '2026-10-11', departureDate: '2026-10-15', days: 4, transportCost: 85, activityNames: ['Sagrada Família Fast-Track Tour', 'Park Güell & Modernism Walk', 'Gothic Quarter Tapas & Sangria Tasting'] },
      ],
    },
    {
      name: 'Japan Autumn Temples & Wonders',
      startDate: '2026-11-05',
      endDate: '2026-11-15',
      description: 'Experience autumn foliage across Tokyo’s neon district and Kyoto’s historic sanctuaries.',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
      shareSlug: 'japan-autumn-2026',
      stops: [
        { cityName: 'Tokyo', arrivalDate: '2026-11-05', departureDate: '2026-11-10', days: 5, transportCost: 180, activityNames: ['Shibuya Crossing & Harajuku Fashion Walk', 'Tsukiji Outer Market Gourmet Food Tour', 'TeamLab Planets Immersive Digital Art', 'Mount Fuji & Hakone Scenic Day Trip'] },
        { cityName: 'Kyoto', arrivalDate: '2026-11-11', departureDate: '2026-11-15', days: 4, transportCost: 110, activityNames: ['Fushimi Inari Shrine Thousand Torii Gates', 'Arashiyama Bamboo Grove & Monkey Park', 'Traditional Tea Ceremony in Gion'] },
      ],
    },
    {
      name: 'USA Coast to Coast Trip',
      startDate: '2026-12-01',
      endDate: '2026-12-12',
      description: 'Metropolitan adventure starting in New York, flying to San Francisco, and wrapping up in Los Angeles.',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
      shareSlug: 'usa-coast-to-coast-2026',
      stops: [
        { cityName: 'New York', arrivalDate: '2026-12-01', departureDate: '2026-12-05', days: 4, transportCost: 200, activityNames: ['Statue of Liberty & Ellis Island Ferry', 'Broadway Show Evening Ticket', 'Summit One Vanderbilt Glass Observation'] },
        { cityName: 'San Francisco', arrivalDate: '2026-12-06', departureDate: '2026-12-09', days: 3, transportCost: 140, activityNames: ['Golden Gate Bridge Bike Tour & Sausalito', 'Alcatraz Island Maximum Security Prison'] },
        { cityName: 'Los Angeles', arrivalDate: '2026-12-10', departureDate: '2026-12-12', days: 2, transportCost: 90, activityNames: ['Los Angeles Highlights Sightseeing Tour', 'Los Angeles Authentic Culinary Walk'] },
      ],
    },
  ];

  for (const tripConf of sampleTrips) {
    await createSampleTrip(demoUser, tripConf);
    await createSampleTrip(khushUser, { ...tripConf, name: `Khush's ${tripConf.name}`, shareSlug: `khush-${tripConf.shareSlug}` });
  }

  console.log('Seed complete! 25 cities, 100+ activities with photos, and 6 sample trips created.');
  console.log('Demo user: demo@globetrotter.com / password123');
  console.log('Khush user: khushptl173@gmail.com / password123');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
