const prisma = require('../lib/prisma');
const { notFound } = require('../utils/errors');
const { formatUser } = require('../utils/format');

async function getUser(id) {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) throw notFound('User not found');
  return formatUser(user);
}

async function updateUser(id, data) {
  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.country !== undefined) updateData.country = data.country;

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  });
  return formatUser(user);
}

module.exports = { getUser, updateUser };
