import { Decimal } from '@prisma/client/runtime/library';
interface ReconciliationResult {
    runId: string;
    recordsProcessed: number;
    matchedRecords: number;
    exceptionRecords: number;
    totalExpectedAmount: Decimal;
    totalReceivedAmount: Decimal;
    totalDifference: Decimal;
}
export declare function runReconciliationEngine(runId: string, emitter?: (event: string, data: unknown) => void): Promise<ReconciliationResult>;
export {};
//# sourceMappingURL=reconciliation.service.d.ts.map