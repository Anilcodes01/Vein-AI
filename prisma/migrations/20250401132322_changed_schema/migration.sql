/*
  Warnings:

  - The values [MALE,FEMALE,OTHER] on the enum `Identity` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Identity_new" AS ENUM ('Male', 'Female', 'Other');
ALTER TABLE "UserDetails" ALTER COLUMN "identity" TYPE "Identity_new" USING ("identity"::text::"Identity_new");
ALTER TYPE "Identity" RENAME TO "Identity_old";
ALTER TYPE "Identity_new" RENAME TO "Identity";
DROP TYPE "Identity_old";
COMMIT;
