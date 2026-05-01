ALTER TABLE "Owner" ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);

UPDATE "Owner"
SET "emailVerifiedAt" = "createdAt"
WHERE "emailVerifiedAt" IS NULL;
