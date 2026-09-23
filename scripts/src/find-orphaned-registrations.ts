// Lists users stuck exactly the way the old two-step /register + /apply flow
// could strand them: an account exists, but no role application was ever
// attached (applicationStatus stayed at its default "none"). These accounts
// predate the new atomic /api/auth/register-and-apply endpoint and won't be
// created going forward, but existing ones need manual follow-up — there's
// no way to recover what role/region they wanted, only who they are.
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const orphaned = await db
    .select({ id: usersTable.id, email: usersTable.email, fullName: usersTable.fullName, createdAt: usersTable.createdAt })
    .from(usersTable)
    .where(eq(usersTable.applicationStatus, "none"));

  if (orphaned.length === 0) {
    console.log("No orphaned registrations found.");
    return;
  }

  console.log(`${orphaned.length} account(s) with no application attached:\n`);
  for (const u of orphaned) {
    console.log(`#${u.id}  ${u.fullName.padEnd(30)}  ${u.email.padEnd(35)}  registered ${u.createdAt?.toISOString().slice(0, 10)}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
