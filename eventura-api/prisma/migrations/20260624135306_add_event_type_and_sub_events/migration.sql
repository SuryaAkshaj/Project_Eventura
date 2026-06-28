-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('FEST', 'COMPETITION', 'WORKSHOP', 'SEMINAR', 'OTHER');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "accommodation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "accommodationInfo" TEXT,
ADD COLUMN     "competitionRules" TEXT,
ADD COLUMN     "eventType" "EventType" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "festEdition" INTEGER,
ADD COLUMN     "guestPerformers" TEXT,
ADD COLUMN     "judgingCriteria" TEXT,
ADD COLUMN     "parentEventId" UUID,
ADD COLUMN     "sponsorNames" TEXT,
ADD COLUMN     "submissionFormat" TEXT;

-- CreateIndex
CREATE INDEX "Event_parentEventId_idx" ON "Event"("parentEventId");

-- CreateIndex
CREATE INDEX "Event_eventType_idx" ON "Event"("eventType");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_parentEventId_fkey" FOREIGN KEY ("parentEventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
