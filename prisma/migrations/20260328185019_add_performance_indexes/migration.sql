-- CreateIndex
CREATE INDEX "Feedback_userId_eventId_idx" ON "Feedback"("userId", "eventId");

-- CreateIndex
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Registration_userId_createdAt_idx" ON "Registration"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Registration_userId_status_idx" ON "Registration"("userId", "status");

-- CreateIndex
CREATE INDEX "Ticket_userId_createdAt_idx" ON "Ticket"("userId", "createdAt" DESC);
