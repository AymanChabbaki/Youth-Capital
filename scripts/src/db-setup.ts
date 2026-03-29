import pg from "pg";

const { Client } = pg;

async function setupDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  try {
    const url = new URL(dbUrl);
    const targetDbName = url.pathname.slice(1).split('?')[0];
    
    const defaultUrl = new URL(dbUrl);
    defaultUrl.pathname = "/postgres";
    
    console.log(`Force resetting database: "${targetDbName}"`);
    
    const client = new Client({ connectionString: defaultUrl.toString() });

    await client.connect();

    // Kill all connections to the target DB if it exists
    try {
      await client.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = $1
          AND pid <> pg_backend_pid();
      `, [targetDbName]);
    } catch (e) {
      // Ignore if DB doesn't exist
    }

    // List all databases
    const listRes = await client.query("SELECT datname FROM pg_database WHERE datistemplate = false");
    const dbs = listRes.rows.map(r => r.datname);
    
    if (dbs.includes(targetDbName)) {
      console.log(`Dropping existing database "${targetDbName}"...`);
      await client.query(`DROP DATABASE "${targetDbName}"`);
    }

    console.log(`Creating database "${targetDbName}"...`);
    await client.query(`CREATE DATABASE "${targetDbName}"`);
    console.log(`Database "${targetDbName}" created successfully.`);
    
    await client.end();
  } catch (error) {
    console.error("Error setting up database:", error);
    process.exit(1);
  }
}

setupDatabase();
