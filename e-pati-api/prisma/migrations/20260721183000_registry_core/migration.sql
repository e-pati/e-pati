-- CreateEnum
CREATE TYPE "AnimalClass" AS ENUM ('PET', 'CATTLE', 'SMALL_RUMINANT', 'STRAY', 'SERVICE');

-- CreateEnum
CREATE TYPE "AnimalSex" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "AnimalStatus" AS ENUM ('ACTIVE', 'LOST', 'ADOPTED', 'SOLD', 'TRANSFERRED', 'DECEASED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AnimalIdentifierType" AS ENUM ('HKN', 'MICROCHIP', 'EAR_TAG', 'PASSPORT', 'QR_TAG');

-- CreateEnum
CREATE TYPE "PremiseType" AS ENUM ('FARM', 'SHELTER', 'CLINIC', 'OWNER_HOME', 'MUNICIPAL_FEEDING_POINT', 'PUBLIC_INSTITUTION');

-- CreateEnum
CREATE TYPE "MovementReason" AS ENUM ('BIRTH', 'SALE', 'TRANSFER', 'SHELTER_INTAKE', 'ADOPTION', 'TREATMENT', 'RETURN_TO_AREA', 'DEATH', 'OTHER');

-- CreateTable
CREATE TABLE "Premise" (
    "id" TEXT NOT NULL,
    "type" "PremiseType" NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT,
    "clinicId" TEXT,
    "ministryCode" TEXT,
    "province" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "neighborhood" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "capacity" INTEGER,
    "currentAnimalCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Premise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Animal" (
    "id" TEXT NOT NULL,
    "hkn" TEXT NOT NULL,
    "class" "AnimalClass" NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT,
    "name" TEXT,
    "sex" "AnimalSex" NOT NULL DEFAULT 'UNKNOWN',
    "birthDate" TIMESTAMP(3),
    "birthPlace" TEXT,
    "color" TEXT,
    "photoUrl" TEXT,
    "status" "AnimalStatus" NOT NULL DEFAULT 'ACTIVE',
    "ownerId" TEXT,
    "clinicId" TEXT,
    "petId" TEXT,
    "currentPremiseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnimalIdentifier" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "type" "AnimalIdentifierType" NOT NULL,
    "value" TEXT NOT NULL,
    "issuedBy" TEXT,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnimalIdentifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnimalMovement" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "fromPremiseId" TEXT,
    "toPremiseId" TEXT,
    "reason" "MovementReason" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnimalMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Premise_ministryCode_key" ON "Premise"("ministryCode");

-- CreateIndex
CREATE INDEX "Premise_ownerId_idx" ON "Premise"("ownerId");

-- CreateIndex
CREATE INDEX "Premise_clinicId_idx" ON "Premise"("clinicId");

-- CreateIndex
CREATE INDEX "Premise_type_idx" ON "Premise"("type");

-- CreateIndex
CREATE INDEX "Premise_province_district_idx" ON "Premise"("province", "district");

-- CreateIndex
CREATE UNIQUE INDEX "Animal_hkn_key" ON "Animal"("hkn");

-- CreateIndex
CREATE UNIQUE INDEX "Animal_petId_key" ON "Animal"("petId");

-- CreateIndex
CREATE INDEX "Animal_class_idx" ON "Animal"("class");

-- CreateIndex
CREATE INDEX "Animal_status_idx" ON "Animal"("status");

-- CreateIndex
CREATE INDEX "Animal_ownerId_idx" ON "Animal"("ownerId");

-- CreateIndex
CREATE INDEX "Animal_clinicId_idx" ON "Animal"("clinicId");

-- CreateIndex
CREATE INDEX "Animal_currentPremiseId_idx" ON "Animal"("currentPremiseId");

-- CreateIndex
CREATE INDEX "Animal_species_idx" ON "Animal"("species");

-- CreateIndex
CREATE UNIQUE INDEX "AnimalIdentifier_type_value_key" ON "AnimalIdentifier"("type", "value");

-- CreateIndex
CREATE INDEX "AnimalIdentifier_animalId_idx" ON "AnimalIdentifier"("animalId");

-- CreateIndex
CREATE INDEX "AnimalIdentifier_value_idx" ON "AnimalIdentifier"("value");

-- CreateIndex
CREATE INDEX "AnimalMovement_animalId_idx" ON "AnimalMovement"("animalId");

-- CreateIndex
CREATE INDEX "AnimalMovement_fromPremiseId_idx" ON "AnimalMovement"("fromPremiseId");

-- CreateIndex
CREATE INDEX "AnimalMovement_toPremiseId_idx" ON "AnimalMovement"("toPremiseId");

-- CreateIndex
CREATE INDEX "AnimalMovement_reason_idx" ON "AnimalMovement"("reason");

-- CreateIndex
CREATE INDEX "AnimalMovement_occurredAt_idx" ON "AnimalMovement"("occurredAt");

-- AddForeignKey
ALTER TABLE "Premise" ADD CONSTRAINT "Premise_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Premise" ADD CONSTRAINT "Premise_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_currentPremiseId_fkey" FOREIGN KEY ("currentPremiseId") REFERENCES "Premise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimalIdentifier" ADD CONSTRAINT "AnimalIdentifier_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimalMovement" ADD CONSTRAINT "AnimalMovement_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimalMovement" ADD CONSTRAINT "AnimalMovement_fromPremiseId_fkey" FOREIGN KEY ("fromPremiseId") REFERENCES "Premise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimalMovement" ADD CONSTRAINT "AnimalMovement_toPremiseId_fkey" FOREIGN KEY ("toPremiseId") REFERENCES "Premise"("id") ON DELETE SET NULL ON UPDATE CASCADE;
