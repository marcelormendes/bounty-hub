-- AlterTable
ALTER TABLE "Client" ADD COLUMN "githubInstallationId" INTEGER,
    ADD COLUMN "githubAccountId" INTEGER,
    ADD COLUMN "githubAccountLogin" TEXT,
    ADD COLUMN "githubAccountType" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Client_githubInstallationId_key" ON "Client"("githubInstallationId");