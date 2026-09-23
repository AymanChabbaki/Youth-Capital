// One-off fix for accounts stranded by the old two-step register+apply flow
// (see find-orphaned-registrations.ts): gives each one a real roleApplications
// row with placeholder data, pre-approved, and assigns the baseline "Active
// Member" role — rather than leaving them stuck or making them redo signup.
import { db } from "@workspace/db";
import { usersTable, roleApplicationsTable, auditLogsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const TARGET_USER_IDS = [19, 21, 22, 23];
const PLACEHOLDER_NOTE = "Application backfilled by admin script — original data was lost when the pre-fix two-step signup flow was interrupted (see auditLog action 'orphan.backfilled').";

async function main() {
  for (const userId of TARGET_USER_IDS) {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      console.log(`#${userId}: not found, skipping`);
      continue;
    }
    if (user.applicationStatus !== "none") {
      console.log(`#${userId} (${user.email}): already has applicationStatus="${user.applicationStatus}", skipping`);
      continue;
    }

    const [application] = await db.insert(roleApplicationsTable).values({
      userId: user.id,
      preferredRole: "Active Member",
      region: "Not specified",
      motivation: PLACEHOLDER_NOTE,
      country: "Morocco",
      languagePreference: user.languagePreference,
      status: "approved",
      assignedRole: "Active Member",
      adminNote: PLACEHOLDER_NOTE,
    }).returning();

    await db.update(usersTable)
      .set({ applicationStatus: "approved", simulationRole: "Active Member" })
      .where(eq(usersTable.id, userId));

    try {
      await db.insert(auditLogsTable).values({
        actorId: null,
        action: "orphan.backfilled",
        targetType: "user",
        targetId: userId,
        metadata: { email: user.email, applicationId: application.id, reason: "pre-fix orphaned registration" },
      });
    } catch (err: any) {
      console.log(`  (audit_logs write skipped — table may not be pushed yet: ${err.message})`);
    }

    console.log(`#${userId} (${user.email}): backfilled application #${application.id}, approved as Active Member`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
