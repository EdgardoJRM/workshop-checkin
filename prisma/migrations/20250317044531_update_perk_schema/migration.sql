-- CreateTable
CREATE TABLE "Perk" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "resourceUrl" TEXT,
    "externalCourseUrl" TEXT,
    "certificateUrl" TEXT,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "isDownloadable" BOOLEAN NOT NULL DEFAULT false,
    "hasPhysicalDelivery" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Perk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPerk" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "perkId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPerk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserPerk_userId_idx" ON "UserPerk"("userId");

-- CreateIndex
CREATE INDEX "UserPerk_perkId_idx" ON "UserPerk"("perkId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPerk_userId_perkId_key" ON "UserPerk"("userId", "perkId");

-- AddForeignKey
ALTER TABLE "UserPerk" ADD CONSTRAINT "UserPerk_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPerk" ADD CONSTRAINT "UserPerk_perkId_fkey" FOREIGN KEY ("perkId") REFERENCES "Perk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
