-- CreateEnum
CREATE TYPE "ChangeCategory" AS ENUM ('pricing', 'feature', 'blog', 'jobs', 'other');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('critical', 'high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "InsightType" AS ENUM ('trend', 'alert', 'opportunity');

-- CreateEnum
CREATE TYPE "ScrapeStatus" AS ENUM ('running', 'completed', 'failed');

-- CreateTable
CREATE TABLE "competitors" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "website" VARCHAR(500) NOT NULL,
    "logo_url" VARCHAR(500),
    "color" VARCHAR(7),
    "pricing_url" VARCHAR(500),
    "blog_url" VARCHAR(500),
    "careers_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "changes" (
    "id" SERIAL NOT NULL,
    "competitor_id" INTEGER NOT NULL,
    "category" "ChangeCategory" NOT NULL,
    "severity" "Severity" NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "summary" TEXT NOT NULL,
    "raw_content" TEXT,
    "source_url" VARCHAR(500),
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insights" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "content" TEXT NOT NULL,
    "insight_type" "InsightType" NOT NULL,
    "competitors" INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scrape_runs" (
    "id" SERIAL NOT NULL,
    "status" "ScrapeStatus" NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "changes_found" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,

    CONSTRAINT "scrape_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "competitors_slug_key" ON "competitors"("slug");

-- CreateIndex
CREATE INDEX "changes_competitor_id_idx" ON "changes"("competitor_id");

-- CreateIndex
CREATE INDEX "changes_category_idx" ON "changes"("category");

-- CreateIndex
CREATE INDEX "changes_detected_at_idx" ON "changes"("detected_at");

-- AddForeignKey
ALTER TABLE "changes" ADD CONSTRAINT "changes_competitor_id_fkey" FOREIGN KEY ("competitor_id") REFERENCES "competitors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
