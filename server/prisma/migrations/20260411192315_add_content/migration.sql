-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "authorId" TEXT NOT NULL,
    "diagnosisId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Content_diagnosisId_fkey" FOREIGN KEY ("diagnosisId") REFERENCES "Diagnosis" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Content_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    CONSTRAINT "Tag_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Bookmark_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ContentToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ContentToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ContentToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Tag_authorId_idx" ON "Tag"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_authorId_slug_key" ON "Tag"("authorId", "slug");

-- CreateIndex
CREATE INDEX "Bookmark_contentId_idx" ON "Bookmark"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_contentId_key" ON "Bookmark"("userId", "contentId");

-- CreateIndex
CREATE UNIQUE INDEX "_ContentToTag_AB_unique" ON "_ContentToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ContentToTag_B_index" ON "_ContentToTag"("B");
