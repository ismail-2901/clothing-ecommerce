-- CreateEnum
CREATE TYPE "SupportTicketPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- AlterTable
ALTER TABLE "SupportTicket" ALTER COLUMN "priority" DROP DEFAULT;
ALTER TABLE "SupportTicket" ALTER COLUMN "priority" TYPE "SupportTicketPriority" USING ("priority"::"SupportTicketPriority");
ALTER TABLE "SupportTicket" ALTER COLUMN "priority" SET DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE "ConversationMessage" ALTER COLUMN "role" TYPE "MessageRole" USING ("role"::"MessageRole");

-- AlterTable / ForeignKey
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_categoryId_fkey";
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropTable
DROP TABLE IF EXISTS "Promotion";
