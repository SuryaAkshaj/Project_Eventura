-- CreateEnum
CREATE TYPE "AccountMode" AS ENUM ('COLLEGE', 'OPEN');

-- AlterTable
ALTER TABLE "College" ADD COLUMN     "orgCategory" TEXT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "createdById" UUID,
ALTER COLUMN "collegeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountMode" "AccountMode" NOT NULL DEFAULT 'COLLEGE',
ADD COLUMN     "orgCategory" TEXT;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
