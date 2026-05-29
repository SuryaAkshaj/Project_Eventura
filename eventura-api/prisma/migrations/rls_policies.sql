-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- Run AFTER `prisma migrate dev` using:
--   psql postgresql://eventura_user:eventura_secret@localhost:5432/eventura -f prisma/migrations/rls_policies.sql
-- ============================================================================

-- Enable RLS on all tenant-scoped tables
ALTER TABLE "Club" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RoleAssignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EventSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Registration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ScanLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Waitlist" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TENANT ISOLATION POLICIES
-- The app sets 'app.current_college_id' and 'app.current_user_id' as
-- PostgreSQL session variables via SET LOCAL before every query.
-- See: src/middleware/tenant.middleware.ts
-- ============================================================================

CREATE POLICY club_isolation ON "Club"
  USING ("collegeId"::text = current_setting('app.current_college_id', true));

CREATE POLICY role_assignment_isolation ON "RoleAssignment"
  USING ("collegeId"::text = current_setting('app.current_college_id', true));

CREATE POLICY event_isolation ON "Event"
  USING (
    "collegeId"::text = current_setting('app.current_college_id', true)
    OR "visibility" = 'PUBLIC'
    OR "visibility" = 'ALL_PLATFORM'
    OR EXISTS (
      SELECT 1 FROM "SharedEvent" se
      WHERE se."eventId" = "Event"."id"
      AND se."collegeId"::text = current_setting('app.current_college_id', true)
    )
  );

CREATE POLICY event_session_isolation ON "EventSession"
  USING (
    EXISTS (
      SELECT 1 FROM "Event" e
      WHERE e."id" = "EventSession"."eventId"
      AND e."collegeId"::text = current_setting('app.current_college_id', true)
    )
  );

CREATE POLICY registration_isolation ON "Registration"
  USING (
    "userId"::text = current_setting('app.current_user_id', true)
    OR EXISTS (
      SELECT 1 FROM "Event" e
      WHERE e."id" = "Registration"."eventId"
      AND e."collegeId"::text = current_setting('app.current_college_id', true)
    )
  );

CREATE POLICY scan_log_isolation ON "ScanLog"
  USING (
    EXISTS (
      SELECT 1 FROM "Registration" r
      JOIN "Event" e ON e."id" = r."eventId"
      WHERE r."id" = "ScanLog"."registrationId"
      AND e."collegeId"::text = current_setting('app.current_college_id', true)
    )
  );

CREATE POLICY waitlist_isolation ON "Waitlist"
  USING (
    "userId"::text = current_setting('app.current_user_id', true)
    OR EXISTS (
      SELECT 1 FROM "Event" e
      WHERE e."id" = "Waitlist"."eventId"
      AND e."collegeId"::text = current_setting('app.current_college_id', true)
    )
  );

-- ============================================================================
-- SUPER ADMIN BYPASS POLICIES
-- Set app.is_super_admin = 'true' in the session to bypass all RLS.
-- This is done in the auth middleware when role === SUPER_ADMIN.
-- ============================================================================

CREATE POLICY super_admin_bypass_clubs ON "Club"
  USING (current_setting('app.is_super_admin', true) = 'true');

CREATE POLICY super_admin_bypass_role_assignments ON "RoleAssignment"
  USING (current_setting('app.is_super_admin', true) = 'true');

CREATE POLICY super_admin_bypass_events ON "Event"
  USING (current_setting('app.is_super_admin', true) = 'true');

CREATE POLICY super_admin_bypass_event_sessions ON "EventSession"
  USING (current_setting('app.is_super_admin', true) = 'true');

CREATE POLICY super_admin_bypass_registrations ON "Registration"
  USING (current_setting('app.is_super_admin', true) = 'true');

CREATE POLICY super_admin_bypass_scan_logs ON "ScanLog"
  USING (current_setting('app.is_super_admin', true) = 'true');

CREATE POLICY super_admin_bypass_waitlist ON "Waitlist"
  USING (current_setting('app.is_super_admin', true) = 'true');
