const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const pool = new Pool({ connectionString: process.env.POSTGRES_URI });

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'MySecretAdminKey';
const checkAdmin = (req, res, next) => {
  if (req.headers['x-api-key'] !== ADMIN_API_KEY)
    return res.status(401).json({ error: 'Unauthorized' });
  next();
};

app.get('/api/sites', async (req, res) => {
  const result = await pool.query('SELECT DISTINCT location, site_name FROM sites');
  const grouped = {};
  result.rows.forEach(({ location, site_name }) => {
    if (!grouped[location]) grouped[location] = [];
    grouped[location].push({ siteName: site_name });
  });
  res.json(grouped);
});

app.get('/api/sites/:siteName', async (req, res) => {
  const result = await pool.query(
    'SELECT year, month, info FROM site_data WHERE site_name = $1 ORDER BY year DESC, month',
    [req.params.siteName]
  );
  res.json({ siteName: req.params.siteName, data: result.rows });
});

app.post('/api/sites', checkAdmin, async (req, res) => {
  const { location, siteName, data } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      'INSERT INTO sites (location, site_name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [location, siteName]
    );
    for (const { year, month, info } of data) {
      await client.query(
        'INSERT INTO site_data (site_name, year, month, info) VALUES ($1, $2, $3, $4)',
        [siteName, year, month, info]
      );
    }
    await client.query('COMMIT');
    res.status(201).json({ message: 'Data saved successfully' });
  } catch {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to save data' });
  } finally {
    client.release();
  }
});

app.listen(process.env.PORT || 5000, () =>
  console.log('Server running on port 5000')
);
