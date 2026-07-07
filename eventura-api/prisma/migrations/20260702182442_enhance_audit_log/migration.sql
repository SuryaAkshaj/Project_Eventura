-- DropIndex
DROP INDEX "AuditLog_eventId_createdAt_idx";

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "collegeId" UUID,
ADD COLUMN     "resourceId" TEXT,
ADD COLUMN     "resourceType" TEXT,
ADD COLUMN     "result" TEXT NOT NULL DEFAULT 'SUCCESS',
ADD COLUMN     "userAgent" TEXT;

-- CreateIndex
CREATE INDEX "AuditLog_collegeId_createdAt_idx" ON "AuditLog"("collegeId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_resourceType_resourceId_idx" ON "AuditLog"("resourceType", "resourceId");
