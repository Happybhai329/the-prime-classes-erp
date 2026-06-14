/*
  Warnings:

  - Added the required column `tenant_id` to the `fee_payments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InstallmentType" AS ENUM ('ONE_TIME', 'MONTHLY', 'QUARTERLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "StudentFeeStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'WAIVED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('MERIT_SCHOLARSHIP', 'STAFF_DISCOUNT', 'SIBLING_DISCOUNT', 'PROMOTIONAL_DISCOUNT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "DiscountMode" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('SUBMITTED', 'REVIEWED', 'LATE');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'NUMERICAL', 'TRUE_FALSE', 'SUBJECTIVE');

-- CreateEnum
CREATE TYPE "OnlineTestMode" AS ENUM ('PRACTICE', 'MOCK', 'SCHOLARSHIP', 'ENTRANCE_SIMULATION');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'AUTO_SUBMITTED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "AchievementType" AS ENUM ('BADGE', 'POINTS', 'LEVEL_UP');

-- CreateEnum
CREATE TYPE "VideoProvider" AS ENUM ('MINIO', 'YOUTUBE', 'VIMEO', 'AWS_MEDIACONVERT', 'M3U8');

-- AlterEnum
ALTER TYPE "FeeType" ADD VALUE 'REGISTRATION';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'FEE_PAYMENT_RECEIVED';
ALTER TYPE "NotificationType" ADD VALUE 'FEE_OVERDUE_REMINDER';
ALTER TYPE "NotificationType" ADD VALUE 'REFUND_PROCESSED';

-- AlterEnum
ALTER TYPE "PaymentMode" ADD VALUE 'CARD';

-- DropForeignKey
ALTER TABLE "fee_payments" DROP CONSTRAINT "fee_payments_invoice_id_fkey";

-- AlterTable
ALTER TABLE "fee_payments" ADD COLUMN     "adjusted_amount" DECIMAL(10,2),
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "installment_id" UUID,
ADD COLUMN     "is_advance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "student_fee_id" UUID,
ADD COLUMN     "tenant_id" UUID NOT NULL,
ADD COLUMN     "transaction_id" VARCHAR(100),
ALTER COLUMN "invoice_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "fee_structures" ADD COLUMN     "academic_year" VARCHAR(20) NOT NULL DEFAULT '2026-27',
ADD COLUMN     "admission_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "course" VARCHAR(255),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "exam_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "installment_type" "InstallmentType" NOT NULL DEFAULT 'ONE_TIME',
ADD COLUMN     "material_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "monthly_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "registration_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "total_fee" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "student_fees" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "fee_structure_id" UUID NOT NULL,
    "academic_year" VARCHAR(20) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(10,2) NOT NULL,
    "paid_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "StudentFeeStatus" NOT NULL DEFAULT 'PENDING',
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "student_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_installments" (
    "id" UUID NOT NULL,
    "student_fee_id" UUID NOT NULL,
    "installment_no" INTEGER NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "due_date" DATE NOT NULL,
    "paid_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_discounts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "student_fee_id" UUID NOT NULL,
    "discount_type" "DiscountType" NOT NULL,
    "discount_mode" "DiscountMode" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT,
    "approved_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fee_discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_refunds" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "student_fee_id" UUID NOT NULL,
    "payment_id" UUID,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "requested_by" UUID NOT NULL,
    "approved_by" UUID,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_receipts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "receipt_number" VARCHAR(50) NOT NULL,
    "student_name" VARCHAR(200) NOT NULL,
    "student_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_mode" "PaymentMode" NOT NULL,
    "payment_date" DATE NOT NULL,
    "fee_description" VARCHAR(500) NOT NULL,
    "qr_data" VARCHAR(500) NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fee_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_categories" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "category_id" UUID,
    "batch_id" UUID,
    "subject_id" UUID,
    "course" VARCHAR(100),
    "chapter" VARCHAR(100),
    "topic" VARCHAR(100),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "file_url" VARCHAR(500) NOT NULL,
    "file_size" INTEGER NOT NULL DEFAULT 0,
    "mime_type" VARCHAR(100),
    "uploaded_by" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_versions" (
    "id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "file_size" INTEGER NOT NULL DEFAULT 0,
    "uploaded_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "material_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_access_logs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "ip_address" VARCHAR(50),
    "user_agent" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "material_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_favorites" (
    "id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "material_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "file_url" VARCHAR(500),
    "deadline" TIMESTAMP NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_submissions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "assignment_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "file_url" VARCHAR(500),
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "score" DECIMAL(5,2),
    "feedback" TEXT,
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignment_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "topic" VARCHAR(100) NOT NULL,
    "difficulty" "DifficultyLevel" NOT NULL,
    "marks" DECIMAL(5,2) NOT NULL,
    "question_type" "QuestionType" NOT NULL,
    "question_text" TEXT NOT NULL,
    "options" JSONB,
    "correct_answer" TEXT NOT NULL,
    "explanation" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "exam_types" "TargetExam"[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_banks" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "subject_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_bank_questions" (
    "question_bank_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,

    CONSTRAINT "question_bank_questions_pkey" PRIMARY KEY ("question_bank_id","question_id")
);

-- CreateTable
CREATE TABLE "online_tests" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "subject_id" UUID,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "test_mode" "OnlineTestMode" NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "total_marks" DECIMAL(6,2) NOT NULL,
    "passing_marks" DECIMAL(6,2) NOT NULL,
    "negative_marking" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "scheduled_start" TIMESTAMP NOT NULL,
    "scheduled_end" TIMESTAMP NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "sectional_settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "online_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "online_test_questions" (
    "online_test_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "marks" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "online_test_questions_pkey" PRIMARY KEY ("online_test_id","question_id")
);

-- CreateTable
CREATE TABLE "test_attempts" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "online_test_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),
    "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "score_obtained" DECIMAL(6,2),
    "accuracy" DECIMAL(5,2),
    "time_spent_seconds" INTEGER,
    "resume_state" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_responses" (
    "id" UUID NOT NULL,
    "test_attempt_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "selected_answer" TEXT,
    "is_correct" BOOLEAN,
    "marks_obtained" DECIMAL(5,2),
    "time_spent_seconds" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_achievements" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "achievement_type" "AchievementType" NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "badge_name" VARCHAR(100),
    "badge_image_url" VARCHAR(500),
    "description" TEXT,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_lectures" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "batch_id" UUID,
    "subject_id" UUID,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "video_url" VARCHAR(500) NOT NULL,
    "provider" "VideoProvider" NOT NULL DEFAULT 'MINIO',
    "duration_seconds" INTEGER,
    "thumbnail_url" VARCHAR(500),
    "is_live" BOOLEAN NOT NULL DEFAULT false,
    "scheduled_start" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "video_lectures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_fees_tenant_id_idx" ON "student_fees"("tenant_id");

-- CreateIndex
CREATE INDEX "student_fees_student_id_idx" ON "student_fees"("student_id");

-- CreateIndex
CREATE INDEX "student_fees_status_idx" ON "student_fees"("status");

-- CreateIndex
CREATE INDEX "student_fees_deleted_at_idx" ON "student_fees"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "student_fees_student_id_fee_structure_id_academic_year_key" ON "student_fees"("student_id", "fee_structure_id", "academic_year");

-- CreateIndex
CREATE INDEX "fee_installments_student_fee_id_idx" ON "fee_installments"("student_fee_id");

-- CreateIndex
CREATE INDEX "fee_installments_due_date_idx" ON "fee_installments"("due_date");

-- CreateIndex
CREATE INDEX "fee_installments_status_idx" ON "fee_installments"("status");

-- CreateIndex
CREATE INDEX "fee_discounts_tenant_id_idx" ON "fee_discounts"("tenant_id");

-- CreateIndex
CREATE INDEX "fee_discounts_student_fee_id_idx" ON "fee_discounts"("student_fee_id");

-- CreateIndex
CREATE INDEX "fee_refunds_tenant_id_idx" ON "fee_refunds"("tenant_id");

-- CreateIndex
CREATE INDEX "fee_refunds_student_fee_id_idx" ON "fee_refunds"("student_fee_id");

-- CreateIndex
CREATE INDEX "fee_refunds_status_idx" ON "fee_refunds"("status");

-- CreateIndex
CREATE UNIQUE INDEX "fee_receipts_payment_id_key" ON "fee_receipts"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "fee_receipts_receipt_number_key" ON "fee_receipts"("receipt_number");

-- CreateIndex
CREATE INDEX "fee_receipts_tenant_id_idx" ON "fee_receipts"("tenant_id");

-- CreateIndex
CREATE INDEX "fee_receipts_student_id_idx" ON "fee_receipts"("student_id");

-- CreateIndex
CREATE INDEX "material_categories_tenant_id_idx" ON "material_categories"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "material_categories_tenant_id_name_key" ON "material_categories"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "materials_tenant_id_idx" ON "materials"("tenant_id");

-- CreateIndex
CREATE INDEX "materials_batch_id_idx" ON "materials"("batch_id");

-- CreateIndex
CREATE INDEX "materials_subject_id_idx" ON "materials"("subject_id");

-- CreateIndex
CREATE INDEX "materials_deleted_at_idx" ON "materials"("deleted_at");

-- CreateIndex
CREATE INDEX "material_access_logs_tenant_id_idx" ON "material_access_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "material_access_logs_material_id_idx" ON "material_access_logs"("material_id");

-- CreateIndex
CREATE INDEX "material_access_logs_user_id_idx" ON "material_access_logs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "material_favorites_student_id_material_id_key" ON "material_favorites"("student_id", "material_id");

-- CreateIndex
CREATE INDEX "assignments_tenant_id_idx" ON "assignments"("tenant_id");

-- CreateIndex
CREATE INDEX "assignments_batch_id_idx" ON "assignments"("batch_id");

-- CreateIndex
CREATE INDEX "assignments_subject_id_idx" ON "assignments"("subject_id");

-- CreateIndex
CREATE INDEX "assignments_deleted_at_idx" ON "assignments"("deleted_at");

-- CreateIndex
CREATE INDEX "assignment_submissions_tenant_id_idx" ON "assignment_submissions"("tenant_id");

-- CreateIndex
CREATE INDEX "assignment_submissions_student_id_idx" ON "assignment_submissions"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "assignment_submissions_assignment_id_student_id_key" ON "assignment_submissions"("assignment_id", "student_id");

-- CreateIndex
CREATE INDEX "questions_tenant_id_idx" ON "questions"("tenant_id");

-- CreateIndex
CREATE INDEX "questions_subject_id_idx" ON "questions"("subject_id");

-- CreateIndex
CREATE INDEX "questions_difficulty_idx" ON "questions"("difficulty");

-- CreateIndex
CREATE INDEX "questions_deleted_at_idx" ON "questions"("deleted_at");

-- CreateIndex
CREATE INDEX "question_banks_tenant_id_idx" ON "question_banks"("tenant_id");

-- CreateIndex
CREATE INDEX "online_tests_tenant_id_idx" ON "online_tests"("tenant_id");

-- CreateIndex
CREATE INDEX "online_tests_batch_id_idx" ON "online_tests"("batch_id");

-- CreateIndex
CREATE INDEX "online_tests_deleted_at_idx" ON "online_tests"("deleted_at");

-- CreateIndex
CREATE INDEX "test_attempts_tenant_id_idx" ON "test_attempts"("tenant_id");

-- CreateIndex
CREATE INDEX "test_attempts_student_id_idx" ON "test_attempts"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "test_attempts_online_test_id_student_id_key" ON "test_attempts"("online_test_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "test_responses_test_attempt_id_question_id_key" ON "test_responses"("test_attempt_id", "question_id");

-- CreateIndex
CREATE INDEX "student_achievements_tenant_id_idx" ON "student_achievements"("tenant_id");

-- CreateIndex
CREATE INDEX "student_achievements_student_id_idx" ON "student_achievements"("student_id");

-- CreateIndex
CREATE INDEX "video_lectures_tenant_id_idx" ON "video_lectures"("tenant_id");

-- CreateIndex
CREATE INDEX "fee_payments_tenant_id_idx" ON "fee_payments"("tenant_id");

-- CreateIndex
CREATE INDEX "fee_payments_student_fee_id_idx" ON "fee_payments"("student_fee_id");

-- CreateIndex
CREATE INDEX "fee_payments_installment_id_idx" ON "fee_payments"("installment_id");

-- CreateIndex
CREATE INDEX "fee_payments_payment_date_idx" ON "fee_payments"("payment_date");

-- CreateIndex
CREATE INDEX "fee_payments_deleted_at_idx" ON "fee_payments"("deleted_at");

-- CreateIndex
CREATE INDEX "fee_structures_academic_year_idx" ON "fee_structures"("academic_year");

-- AddForeignKey
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "fee_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_student_fee_id_fkey" FOREIGN KEY ("student_fee_id") REFERENCES "student_fees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_installment_id_fkey" FOREIGN KEY ("installment_id") REFERENCES "fee_installments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_fees" ADD CONSTRAINT "student_fees_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_fees" ADD CONSTRAINT "student_fees_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_fees" ADD CONSTRAINT "student_fees_fee_structure_id_fkey" FOREIGN KEY ("fee_structure_id") REFERENCES "fee_structures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_installments" ADD CONSTRAINT "fee_installments_student_fee_id_fkey" FOREIGN KEY ("student_fee_id") REFERENCES "student_fees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_discounts" ADD CONSTRAINT "fee_discounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_discounts" ADD CONSTRAINT "fee_discounts_student_fee_id_fkey" FOREIGN KEY ("student_fee_id") REFERENCES "student_fees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_refunds" ADD CONSTRAINT "fee_refunds_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_refunds" ADD CONSTRAINT "fee_refunds_student_fee_id_fkey" FOREIGN KEY ("student_fee_id") REFERENCES "student_fees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_receipts" ADD CONSTRAINT "fee_receipts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_receipts" ADD CONSTRAINT "fee_receipts_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "fee_payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_categories" ADD CONSTRAINT "material_categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "material_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_versions" ADD CONSTRAINT "material_versions_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_versions" ADD CONSTRAINT "material_versions_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_access_logs" ADD CONSTRAINT "material_access_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_access_logs" ADD CONSTRAINT "material_access_logs_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_access_logs" ADD CONSTRAINT "material_access_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_favorites" ADD CONSTRAINT "material_favorites_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_favorites" ADD CONSTRAINT "material_favorites_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_banks" ADD CONSTRAINT "question_banks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_banks" ADD CONSTRAINT "question_banks_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_bank_questions" ADD CONSTRAINT "question_bank_questions_question_bank_id_fkey" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_bank_questions" ADD CONSTRAINT "question_bank_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "online_tests" ADD CONSTRAINT "online_tests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "online_tests" ADD CONSTRAINT "online_tests_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "online_tests" ADD CONSTRAINT "online_tests_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "online_test_questions" ADD CONSTRAINT "online_test_questions_online_test_id_fkey" FOREIGN KEY ("online_test_id") REFERENCES "online_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "online_test_questions" ADD CONSTRAINT "online_test_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_online_test_id_fkey" FOREIGN KEY ("online_test_id") REFERENCES "online_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_responses" ADD CONSTRAINT "test_responses_test_attempt_id_fkey" FOREIGN KEY ("test_attempt_id") REFERENCES "test_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_achievements" ADD CONSTRAINT "student_achievements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_achievements" ADD CONSTRAINT "student_achievements_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_lectures" ADD CONSTRAINT "video_lectures_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_lectures" ADD CONSTRAINT "video_lectures_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_lectures" ADD CONSTRAINT "video_lectures_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
