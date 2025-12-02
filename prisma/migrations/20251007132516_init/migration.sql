-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ELDER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('MARRIAGE_GUIDANCE', 'AGRICULTURE', 'CONFLICT_RESOLUTION', 'HEALTH_WELLNESS', 'MORAL_CONDUCT', 'TRADITIONAL_CEREMONIES', 'PROVERBS', 'STORIES', 'LIFE_LESSONS', 'COMMUNITY_VALUES');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('KINYARWANDA', 'ENGLISH', 'FRENCH');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "profileImage" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wisdoms" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "language" "Language" NOT NULL DEFAULT 'KINYARWANDA',
    "audioUrl" TEXT,
    "imageUrl" TEXT,
    "tags" TEXT[],
    "views" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "wisdoms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "wisdomId" TEXT NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "wisdomId" TEXT NOT NULL,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "wisdomId" TEXT NOT NULL,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "wisdoms_category_idx" ON "wisdoms"("category");

-- CreateIndex
CREATE INDEX "wisdoms_language_idx" ON "wisdoms"("language");

-- CreateIndex
CREATE INDEX "wisdoms_createdAt_idx" ON "wisdoms"("createdAt");

-- CreateIndex
CREATE INDEX "comments_wisdomId_idx" ON "comments"("wisdomId");

-- CreateIndex
CREATE INDEX "comments_userId_idx" ON "comments"("userId");

-- CreateIndex
CREATE INDEX "likes_wisdomId_idx" ON "likes"("wisdomId");

-- CreateIndex
CREATE UNIQUE INDEX "likes_userId_wisdomId_key" ON "likes"("userId", "wisdomId");

-- CreateIndex
CREATE INDEX "bookmarks_userId_idx" ON "bookmarks"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_userId_wisdomId_key" ON "bookmarks"("userId", "wisdomId");

-- AddForeignKey
ALTER TABLE "wisdoms" ADD CONSTRAINT "wisdoms_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_wisdomId_fkey" FOREIGN KEY ("wisdomId") REFERENCES "wisdoms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_wisdomId_fkey" FOREIGN KEY ("wisdomId") REFERENCES "wisdoms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_wisdomId_fkey" FOREIGN KEY ("wisdomId") REFERENCES "wisdoms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
