-- DropIndex
DROP INDEX "Event_city_idx";

-- DropIndex
DROP INDEX "Event_isFeatured_idx";

-- DropIndex
DROP INDEX "Event_startDate_idx";

-- DropIndex
DROP INDEX "Event_title_idx";

-- CreateIndex
CREATE INDEX "Event_status_startDate_idx" ON "Event"("status", "startDate" ASC);

-- CreateIndex
CREATE INDEX "Event_categoryId_status_startDate_idx" ON "Event"("categoryId", "status", "startDate" ASC);

-- CreateIndex
CREATE INDEX "Event_eventType_status_startDate_idx" ON "Event"("eventType", "status", "startDate" ASC);

-- CreateIndex
CREATE INDEX "Event_isOnline_status_startDate_idx" ON "Event"("isOnline", "status", "startDate" ASC);

-- CreateIndex
CREATE INDEX "Event_isFeatured_status_idx" ON "Event"("isFeatured", "status");

-- CreateIndex
CREATE INDEX "Event_publishedAt_idx" ON "Event"("publishedAt" DESC);
