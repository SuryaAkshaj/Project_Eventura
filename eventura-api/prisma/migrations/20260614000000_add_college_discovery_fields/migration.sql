-- AlterTable: add new discovery fields to College
ALTER TABLE "College"
  ADD COLUMN "coverImageUrl"  TEXT,
  ADD COLUMN "city"           TEXT,
  ADD COLUMN "state"          TEXT,
  ADD COLUMN "phone"          TEXT,
  ADD COLUMN "instagram"      TEXT,
  ADD COLUMN "description"    TEXT,
  ADD COLUMN "type"           TEXT,
  ADD COLUMN "slug"           TEXT,
  ADD COLUMN "totalStudents"  INTEGER,
  ADD COLUMN "establishedYear" INTEGER,
  ADD COLUMN "isSeeded"       BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "College_slug_key" ON "College"("slug");
CREATE INDEX "College_slug_idx"  ON "College"("slug");
CREATE INDEX "College_city_idx"  ON "College"("city");
CREATE INDEX "College_state_idx" ON "College"("state");
CREATE INDEX "College_type_idx"  ON "College"("type");
