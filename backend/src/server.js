require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3001;

if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL in .env');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET in .env');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`GlobeTrotter API running on http://localhost:${PORT}`);
});
