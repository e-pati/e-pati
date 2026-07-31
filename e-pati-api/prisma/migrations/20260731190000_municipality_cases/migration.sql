-- CreateEnum
CREATE TYPE "MunicipalityCaseStatus" AS ENUM ('INTAKE', 'UNDER_TREATMENT', 'STERILIZED', 'ADOPTION_READY', 'ADOPTED', 'RETURNED_TO_AREA', 'CLOSED');

-- CreateEnum
CREATE TYPE "SterilizationStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "AdoptionListingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'RESERVED', 'ADOPTED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "MunicipalityAnimalCase" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "shelterPremiseId" TEXT NOT NULL,
    "caseNumber" TEXT,
    "municipalityName" TEXT NOT NULL,
    "intakeSource" TEXT,
    "intakeAt" TIMESTAMP(3) NOT NULL,
    "foundProvince" TEXT NOT NULL,
    "foundDistrict" TEXT NOT NULL,
    "foundNeighborhood" TEXT,
    "publicLocationNote" TEXT,
    "status" "MunicipalityCaseStatus" NOT NULL DEFAULT 'INTAKE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MunicipalityAnimalCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SterilizationRecord" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL,
    "veterinarianName" TEXT NOT NULL,
    "clinicName" TEXT,
    "anesthesiaNotes" TEXT,
    "surgeryNotes" TEXT,
    "complicationNotes" TEXT,
    "status" "SterilizationStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SterilizationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdoptionListing" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "healthSummary" TEXT,
    "suitabilityNotes" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "status" "AdoptionListingStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "adoptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdoptionListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MunicipalityAnimalCase_caseNumber_key" ON "MunicipalityAnimalCase"("caseNumber");

-- CreateIndex
CREATE INDEX "MunicipalityAnimalCase_animalId_idx" ON "MunicipalityAnimalCase"("animalId");

-- CreateIndex
CREATE INDEX "MunicipalityAnimalCase_shelterPremiseId_idx" ON "MunicipalityAnimalCase"("shelterPremiseId");

-- CreateIndex
CREATE INDEX "MunicipalityAnimalCase_status_idx" ON "MunicipalityAnimalCase"("status");

-- CreateIndex
CREATE INDEX "MunicipalityAnimalCase_foundProvince_foundDistrict_idx" ON "MunicipalityAnimalCase"("foundProvince", "foundDistrict");

-- CreateIndex
CREATE INDEX "MunicipalityAnimalCase_intakeAt_idx" ON "MunicipalityAnimalCase"("intakeAt");

-- CreateIndex
CREATE INDEX "SterilizationRecord_caseId_idx" ON "SterilizationRecord"("caseId");

-- CreateIndex
CREATE INDEX "SterilizationRecord_performedAt_idx" ON "SterilizationRecord"("performedAt");

-- CreateIndex
CREATE INDEX "SterilizationRecord_status_idx" ON "SterilizationRecord"("status");

-- CreateIndex
CREATE INDEX "AdoptionListing_caseId_idx" ON "AdoptionListing"("caseId");

-- CreateIndex
CREATE INDEX "AdoptionListing_status_idx" ON "AdoptionListing"("status");

-- CreateIndex
CREATE INDEX "AdoptionListing_publishedAt_idx" ON "AdoptionListing"("publishedAt");

-- AddForeignKey
ALTER TABLE "MunicipalityAnimalCase" ADD CONSTRAINT "MunicipalityAnimalCase_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MunicipalityAnimalCase" ADD CONSTRAINT "MunicipalityAnimalCase_shelterPremiseId_fkey" FOREIGN KEY ("shelterPremiseId") REFERENCES "Premise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SterilizationRecord" ADD CONSTRAINT "SterilizationRecord_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "MunicipalityAnimalCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdoptionListing" ADD CONSTRAINT "AdoptionListing_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "MunicipalityAnimalCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
