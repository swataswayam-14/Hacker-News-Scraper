-- CreateTable
CREATE TABLE "stories" (
    "id" SERIAL NOT NULL,
    "hacker_news_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "author" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stories_hacker_news_id_key" ON "stories"("hacker_news_id");

-- CreateIndex
CREATE INDEX "stories_created_at_idx" ON "stories"("created_at");

-- CreateIndex
CREATE INDEX "stories_hacker_news_id_idx" ON "stories"("hacker_news_id");
