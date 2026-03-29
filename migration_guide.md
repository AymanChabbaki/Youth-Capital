# Database Migration Guide: Supabase Professional Setup

This guide provides professional, high-end instructions for migrating your simulation's civic database from local PostgreSQL to Supabase.

## 1. Local Export Completed
I have already generated your digital migration fragments:
- **[db_schema.sql](file:///c:/Users/HP/ZBOOK/Desktop/youthCapital/db_schema.sql)**: The complete structural blueprint of the simulation.
- **[db_data.sql](file:///c:/Users/HP/ZBOOK/Desktop/youthCapital/db_data.sql)**: All existing civic records, applications, and activity results.

## 2. Supabase Infrastructure Preparation

### Setup
1. Create a new project in your **Supabase Dashboard**.
2. Navigate to **SQL Editor** in the left sidebar.
3. Open a **New Query**.

## 3. Professional Import Succession

### Phase 1: Structural Restoration
> [!IMPORTANT]
> Always restore the schema first to ensure the simulation's architectural rules are established before importing data.

1. Open **[db_schema.sql](file:///c:/Users/HP/ZBOOK/Desktop/youthCapital/db_schema.sql)**.
2. Copy the entire contents.
3. Paste into the Supabase SQL Editor and click **Run**.

### Phase 2: Data Population
> [!NOTE]
> This step populates your civic registries (users, articles, events, etc.).

1. Create another **New Query**.
2. Open **[db_data.sql](file:///c:/Users/HP/ZBOOK/Desktop/youthCapital/db_data.sql)**.
3. Copy the entire contents.
4. Paste into the Supabase SQL Editor and click **Run**.

## 4. Platform Re-Link

Once imported, don't forget to update your **Vercel Backend** `DATABASE_URL` with your new Supabase connection string:
- Found in: **Project Settings > Database > Connection String (Transaction mode is recommended).**

---

**The simulation's digital heritage is now ready for cloud-scale governance!** 🚀
