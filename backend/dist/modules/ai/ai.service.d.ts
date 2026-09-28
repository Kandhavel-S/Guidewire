import OpenAI from 'openai';
export declare function getAIClient(): OpenAI | null;
export declare const AI_MODEL: string;
export interface ExceptionAnalysisResponse {
    summary: string;
    likelyCause: string;
    financialImpact: string;
    evidence: string[];
    recommendedActions: string[];
    confidence: 'LOW' | 'MEDIUM' | 'HIGH';
}
export interface AIInsight {
    title: string;
    description: string;
    severity: 'INFO' | 'WARNING' | 'HIGH';
}
export interface DashboardInsightsResponse {
    insights: AIInsight[];
}
export declare function generateFallbackAnalysis(exceptionData: {
    type: string;
    expectedAmount: number;
    actualAmount: number;
    difference: number;
    customerName: string;
    policyNumber: string;
    invoiceNumber: string;
    policyType: string;
}): ExceptionAnalysisResponse;
export declare function callAI(systemPrompt: string, userPrompt: string, expectJSON?: boolean): Promise<string>;
//# sourceMappingURL=ai.service.d.ts.map