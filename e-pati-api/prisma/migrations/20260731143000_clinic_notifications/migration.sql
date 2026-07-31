ALTER TABLE "Notification" DROP CONSTRAINT "Notification_ownerId_fkey";

ALTER TABLE "Notification" ALTER COLUMN "ownerId" DROP NOT NULL;
ALTER TABLE "Notification" ADD COLUMN "clinicId" TEXT;

CREATE INDEX "Notification_clinicId_idx" ON "Notification"("clinicId");

ALTER TABLE "Notification" ADD CONSTRAINT "Notification_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipient_check" CHECK ("ownerId" IS NOT NULL OR "clinicId" IS NOT NULL);
