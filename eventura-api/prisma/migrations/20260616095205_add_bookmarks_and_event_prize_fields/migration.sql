-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "prizePool" DECIMAL(12,2),
ADD COLUMN     "registrationDeadline" TIMESTAMP(3),
ADD COLUMN     "teamSizeMax" INTEGER,
ADD COLUMN     "teamSizeMin" INTEGER;

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bookmark_userId_idx" ON "Bookmark"("userId");

-- CreateIndex
CREATE INDEX "Bookmark_eventId_idx" ON "Bookmark"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_eventId_key" ON "Bookmark"("userId", "eventId");

-- CreateIndex
CREATE INDEX "Event_registrationDeadline_idx" ON "Event"("registrationDeadline");

-- CreateIndex
CREATE INDEX "Event_prizePool_idx" ON "Event"("prizePool");

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
