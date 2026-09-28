-- CreateEnum
CREATE TYPE "MLPredictionType" AS ENUM ('PAYMENT_ANOMALY', 'LATE_PAYMENT');

-- CreateTable
CREATE TABLE "ml_predictions" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT,
    "exceptionId" TEXT,
    "predictionType" "MLPredictionType" NOT NULL,
    "modelName" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "prediction" BOOLEAN,
    "features" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ml_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ml_predictions_predictionType_createdAt_idx" ON "ml_predictions"("predictionType", "createdAt");
CREATE INDEX "ml_predictions_riskLevel_createdAt_idx" ON "ml_predictions"("riskLevel", "createdAt");

-- AddForeignKey
ALTER TABLE "ml_predictions" ADD CONSTRAINT "ml_predictions_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ml_predictions" ADD CONSTRAINT "ml_predictions_exceptionId_fkey" FOREIGN KEY ("exceptionId") REFERENCES "payment_exceptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
