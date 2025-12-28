const express = require('express');
const { Client } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Get database credentials from service binding
const vcapServices = JSON.parse(process.env.VCAP_SERVICES || '{}');
const postgresService = vcapServices['postgresql-db']?.[0]?.credentials;

if (!postgresService) {
  console.error('PostgreSQL service binding not found');
  process.exit(1);
}

const client = new Client({
  host: postgresService.hostname,
  port: postgresService.port,
  database: postgresService.dbname,
  user: postgresService.username,
  password: postgresService.password,
  ssl: { rejectUnauthorized: false }
});

// Connect to database
client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');
    // Create sample table
    return client.query(`
      CREATE TABLE IF NOT EXISTS "SampleTable" (
        "ID" INTEGER PRIMARY KEY,
        "Name" VARCHAR(100)
      );
    `);
  })
  .then(() => {
    console.log('SampleTable created/verified');
    // Insert sample data if table is empty
    return client.query(`
      INSERT INTO "SampleTable" ("ID", "Name")
      SELECT * FROM (VALUES (1, 'Sample Entry 1'), (2, 'Sample Entry 2')) AS v("ID", "Name")
      WHERE NOT EXISTS (SELECT 1 FROM "SampleTable" WHERE "ID" = 1);
    `);
  })
  .then(() => console.log('Sample data inserted'))
  .catch(err => console.error('Database setup error:', err));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend service is running' });
});

app.get('/api/data', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM "SampleTable" ORDER BY "ID"');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.post('/api/data', async (req, res) => {
  try {
    const { id, name } = req.body;
    if (!id || !name) {
      return res.status(400).json({
        success: false,
        error: 'ID and Name are required'
      });
    }

    await client.query(
      'INSERT INTO "SampleTable" ("ID", "Name") VALUES ($1, $2) ON CONFLICT ("ID") DO UPDATE SET "Name" = EXCLUDED."Name"',
      [id, name]
    );

    res.json({
      success: true,
      message: 'Data saved successfully'
    });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.delete('/api/data/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await client.query('DELETE FROM "SampleTable" WHERE "ID" = $1', [id]);

    if (result.rowCount > 0) {
      res.json({
        success: true,
        message: 'Data deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Backend service listening on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  client.end();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  client.end();
  process.exit(0);
});