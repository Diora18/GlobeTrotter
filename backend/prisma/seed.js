const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const STAY_COST_PER_INDEX = 50;

const cities = [
  { name: 'Paris', country: 'France', region: 'Europe', costIndex: 8, popularity: 95, imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800' },
  { name: 'Rome', country: 'Italy', region: 'Europe', costIndex: 7, popularity: 90, imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800' },
  { name: 'Barcelona', country: 'Spain', region: 'Europe', costIndex: 6, popularity: 88, imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a84ef013?w=800' },
  { name: 'London', country: 'United Kingdom', region: 'Europe', costIndex: 9, popularity: 92, imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800' },
  { name: 'Amsterdam', country: 'Netherlands', region: 'Europe', costIndex: 7, popularity: 85, imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96fd019?w=800' },
  { name: 'Tokyo', country: 'Japan', region: 'Asia', costIndex: 8, popularity: 94, imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800' },
  { name: 'Bangkok', country: 'Thailand', region: 'Asia', costIndex: 4, popularity: 87, imageUrl: 'https://images.unsplash.com/photo-1563492065-73a5a902da26?w=800' },
  { name: 'Singapore', country: 'Singapore', region: 'Asia', costIndex: 8, popularity: 86, imageUrl: 'https://images.unsplash.com/photo-1525621480887-4f8a7e5a7c1b?w=800' },
  { name: 'New York', country: 'United States', region: 'North America', costIndex: 9, popularity: 96, imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800' },
  { name: 'San Francisco', country: 'United States', region: 'North America', costIndex: 9, popularity: 82, imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800' },
  { name: 'Dubai', country: 'United Arab Emirates', region: 'Middle East', costIndex: 8, popularity: 84, imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800' },
  { name: 'Sydney', country: 'Australia', region: 'Oceania', costIndex: 7, popularity: 80, imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800' },
];

const activitiesByCity = {
  Paris: [
    { name: 'Eiffel Tower Visit', description: 'Visit the iconic Eiffel Tower with optional summit access', type: 'sightseeing', estimatedCost: 30, durationMinutes: 120 },
    { name: 'Louvre Museum', description: 'Explore world-famous art including the Mona Lisa', type: 'culture', estimatedCost: 20, durationMinutes: 180 },
    { name: 'Seine River Cruise', description: 'Evening boat cruise along the Seine', type: 'sightseeing', estimatedCost: 18, durationMinutes: 90 },
    { name: 'French Pastry Tour', description: 'Guided tasting tour of Parisian bakeries', type: 'food', estimatedCost: 65, durationMinutes: 150 },
  ],
  Rome: [
    { name: 'Colosseum Tour', description: 'Guided tour of the ancient Colosseum', type: 'sightseeing', estimatedCost: 28, durationMinutes: 120 },
    { name: 'Vatican Museums', description: 'Visit the Sistine Chapel and Vatican art collections', type: 'culture', estimatedCost: 25, durationMinutes: 180 },
    { name: 'Trastevere Food Walk', description: 'Evening food walk through Trastevere', type: 'food', estimatedCost: 55, durationMinutes: 150 },
  ],
  Tokyo: [
    { name: 'Shibuya & Harajuku Walk', description: 'Explore trendy neighborhoods and street fashion', type: 'sightseeing', estimatedCost: 0, durationMinutes: 180 },
    { name: 'Tsukiji Outer Market Food Tour', description: 'Sample fresh sushi and street food', type: 'food', estimatedCost: 45, durationMinutes: 120 },
    { name: 'TeamLab Borderless', description: 'Immersive digital art museum experience', type: 'culture', estimatedCost: 32, durationMinutes: 150 },
  ],
  'New York': [
    { name: 'Central Park Bike Ride', description: 'Rent a bike and explore Central Park', type: 'adventure', estimatedCost: 25, durationMinutes: 120 },
    { name: 'Broadway Show', description: 'Evening Broadway theatre performance', type: 'culture', estimatedCost: 120, durationMinutes: 150 },
    { name: 'Brooklyn Bridge Walk', description: 'Walk across the Brooklyn Bridge at sunset', type: 'sightseeing', estimatedCost: 0, durationMinutes: 90 },
  ],
};

async function findOrCreateCity(cityData) {
  const existing = await prisma.city.findFirst({ where: { name: cityData.name } });
  if (existing) return existing;
  return prisma.city.create({ data: cityData });
}

async function main() {
  console.log('Seeding database...');

  for (const cityData of cities) {
    const city = await findOrCreateCity(cityData);

    const cityActivities = activitiesByCity[city.name] || [
      { name: `${city.name} City Tour`, description: `Highlights tour of ${city.name}`, type: 'sightseeing', estimatedCost: 35, durationMinutes: 120 },
      { name: `${city.name} Local Food Experience`, description: `Taste local cuisine in ${city.name}`, type: 'food', estimatedCost: 40, durationMinutes: 90 },
    ];

    for (const activity of cityActivities) {
      const existing = await prisma.activity.findFirst({
        where: { cityId: city.id, name: activity.name },
      });

      if (!existing) {
        await prisma.activity.create({ data: { ...activity, cityId: city.id } });
      }
    }
  }

  const passwordHash = await bcrypt.hash('password123', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@globetrotter.com' },
    update: {},
    create: {
      email: 'demo@globetrotter.com',
      passwordHash,
      name: 'Demo Traveler',
    },
  });

  const paris = await prisma.city.findFirst({ where: { name: 'Paris' } });
  const rome = await prisma.city.findFirst({ where: { name: 'Rome' } });

  if (paris && rome) {
    const existingTrip = await prisma.trip.findFirst({
      where: { userId: demoUser.id, name: 'Europe Summer' },
    });

    if (!existingTrip) {
      const trip = await prisma.trip.create({
        data: {
          userId: demoUser.id,
          name: 'Europe Summer',
          startDate: new Date('2026-06-01'),
          endDate: new Date('2026-06-15'),
          description: 'Two week adventure through France and Italy',
          coverPhotoUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
        },
      });

      const parisStop = await prisma.tripStop.create({
        data: {
          tripId: trip.id,
          cityId: paris.id,
          arrivalDate: new Date('2026-06-01'),
          departureDate: new Date('2026-06-05'),
          orderIndex: 0,
          estimatedTransportCost: 120,
          estimatedStayCost: 4 * paris.costIndex * STAY_COST_PER_INDEX,
        },
      });

      const romeStop = await prisma.tripStop.create({
        data: {
          tripId: trip.id,
          cityId: rome.id,
          arrivalDate: new Date('2026-06-06'),
          departureDate: new Date('2026-06-12'),
          orderIndex: 1,
          estimatedTransportCost: 80,
          estimatedStayCost: 6 * rome.costIndex * STAY_COST_PER_INDEX,
        },
      });

      const eiffel = await prisma.activity.findFirst({
        where: { cityId: paris.id, name: 'Eiffel Tower Visit' },
      });
      const colosseum = await prisma.activity.findFirst({
        where: { cityId: rome.id, name: 'Colosseum Tour' },
      });

      if (eiffel) {
        await prisma.stopActivity.create({
          data: {
            stopId: parisStop.id,
            activityId: eiffel.id,
            scheduledAt: new Date('2026-06-02T10:00:00.000Z'),
            orderIndex: 0,
          },
        });
      }

      if (colosseum) {
        await prisma.stopActivity.create({
          data: {
            stopId: romeStop.id,
            activityId: colosseum.id,
            scheduledAt: new Date('2026-06-07T09:30:00.000Z'),
            orderIndex: 0,
          },
        });
      }
    }
  }

  console.log('Seed complete.');
  console.log('Demo user: demo@globetrotter.com / password123');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
