-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_eventId_createdAt_idx" ON "AuditLog"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "Bookmark_userId_createdAt_idx" ON "Bookmark"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Certificate_registrationId_issuedAt_idx" ON "Certificate"("registrationId", "issuedAt");

-- CreateIndex
CREATE INDEX "Event_collegeId_status_idx" ON "Event"("collegeId", "status");

-- CreateIndex
CREATE INDEX "Event_collegeId_startDate_idx" ON "Event"("collegeId", "startDate");

-- CreateIndex
CREATE INDEX "Event_status_startDate_idx" ON "Event"("status", "startDate");

-- CreateIndex
CREATE INDEX "Event_collegeId_status_startDate_idx" ON "Event"("collegeId", "status", "startDate");

-- CreateIndex
CREATE INDEX "Event_collegeId_visibility_status_idx" ON "Event"("collegeId", "visibility", "status");

-- CreateIndex
CREATE INDEX "Event_eventType_status_startDate_idx" ON "Event"("eventType", "status", "startDate");

-- CreateIndex
CREATE INDEX "EventFeedback_eventId_rating_idx" ON "EventFeedback"("eventId", "rating");

-- CreateIndex
CREATE INDEX "EventFeedback_eventId_createdAt_idx" ON "EventFeedback"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_status_createdAt_idx" ON "Payment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_registrationId_status_idx" ON "Payment"("registrationId", "status");

-- CreateIndex
CREATE INDEX "Registration_eventId_status_idx" ON "Registration"("eventId", "status");

-- CreateIndex
CREATE INDEX "Registration_userId_status_idx" ON "Registration"("userId", "status");

-- CreateIndex
CREATE INDEX "Registration_userId_createdAt_idx" ON "Registration"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Registration_eventId_createdAt_idx" ON "Registration"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "Registration_eventId_paymentStatus_idx" ON "Registration"("eventId", "paymentStatus");
