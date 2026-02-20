// CommonJS re-export of Prisma Client
const { PrismaClient } = require('@prisma/client');

module.exports = {
  PrismaClient,
  ...require('@prisma/client')
};
