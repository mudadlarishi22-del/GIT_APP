const { Client } = require('pg');

const client = new Client({
  host: 'postgres-1f57f59f-d69a-4025-9971-0423a2fcdf7f.cqryblsdrbcs.us-east-1.rds.amazonaws.com',
  port: 7235,
  database: 'QRDemtIKVmdt',
  user: '6ab5b4b4e6c8',
  password: '18665f08df99135cfe7eb60',
  ssl: {
    rejectUnauthorized: false
  }
});

async function createTable() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database!');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS "SampleTable" (
        "ID" INTEGER PRIMARY KEY,
        "Name" VARCHAR(100)
      );
    `;

    await client.query(createTableQuery);
    console.log('SampleTable created successfully!');

    // Insert some sample data
    const insertQuery = `
      INSERT INTO "SampleTable" ("ID", "Name") VALUES
      (1, 'Sample Entry 1'),
      (2, 'Sample Entry 2')
      ON CONFLICT ("ID") DO NOTHING;
    `;

    await client.query(insertQuery);
    console.log('Sample data inserted!');

    // Query the table
    const result = await client.query('SELECT * FROM "SampleTable"');
    console.log('Table contents:', result.rows);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Connection closed.');
  }
}

createTable();