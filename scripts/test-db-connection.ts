import pg from "pg";

const { Client } = pg;

// -- HARDENED TRANSACTION POOLER URL --
const connectionString = "postgresql://postgres.nhrpshxstzrmfembuzzo:Ayman%40l7way1@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

async function testConnection() {
  console.log("🚀 Initiating Sectoral Connectivity Audit...");
  console.log(`📡 Target: pooler.supabase.com (Port 6543)`);

  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log("✅ SUCCESS: Governing Heartbeat Connected!");

    const res = await client.query("SELECT count(*) as user_count from \"users\"");
    console.log(`📊 Sectoral Data Verified: ${res.rows[0].user_count} citizens found.`);

    await client.end();
    console.log("🏁 Audit Finalized: Platform is Cloud-Ready.");
  } catch (err) {
    console.error("❌ FAILURE: Digital Infrastructure is Disconnected.");
    console.error(err);
    process.exit(1);
  }
}

testConnection();
