const prisma = require('../lib/prisma');
const { notFound } = require('../utils/errors');
const { formatCity } = require('../utils/format');

async function listCities({ q, country, region, sort = 'popularity', limit = 20 }) {
  const where = {};

  if (q) {
    where.name = { contains: q, mode: 'insensitive' };
  }
  if (country) {
    where.country = { contains: country, mode: 'insensitive' };
  }
  if (region) {
    where.region = { equals: region, mode: 'insensitive' };
  }

  let orderBy = { popularity: 'desc' };
  if (sort === 'name') orderBy = { name: 'asc' };
  if (sort === 'costIndex') orderBy = { costIndex: 'asc' };

  const cities = await prisma.city.findMany({
    where,
    orderBy,
    take: Number(limit),
  });

  return cities.map(formatCity);
}

async function getCityById(cityId) {
  const city = await prisma.city.findUnique({ where: { id: cityId } });
  if (!city) throw notFound('City not found');
  return formatCity(city);
}

module.exports = { listCities, getCityById };
