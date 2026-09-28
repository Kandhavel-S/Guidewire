import OpenAI from 'openai';
import { env } from '../../config/env';

let client: OpenAI | null = null;

export function getAIClient(): OpenAI | null {
  if (!env.OPENROUTER_API_KEY || env.OPENROUTER_API_KEY === 'your-openrouter-api-key-here') {
    return null;
  }

  if (!client) {
    // OpenRouter uses the same OpenAI SDK, but with its own baseURL and two
    // required attribution headers (HTTP-Referer and X-Title).
    client = new OpenAI({
      apiKey: env.OPENROUTER_API_KEY,
      baseURL: env.OPENROUTER_BASE_URL,
      defaultHeaders: {
        'HTTP-Referer': env.FRONTEND_URL,   // your site URL
        'X-Title': 'InsureFlow',             // your app name
      },
    });
  }

  return client;
}

export const AI_MODEL = env.OPENROUTER_MODEL;

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

// Fallback analysis when AI is unavailable — deterministic, data-driven
export function generateFallbackAnalysis(exceptionData: {
  type: string;
  expectedAmount: number;
  actualAmount: number;
  difference: number;
  customerName: string;
  policyNumber: string;
  invoiceNumber: string;
  policyType: string;
}): ExceptionAnalysisResponse {
  const { type, expectedAmount, actualAmount, difference, customerName, policyNumber } = exceptionData;

  const formatINR = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  const analyses: Record<string, ExceptionAnalysisResponse> = {
    UNDERPAYMENT: {
      summary: `Partial payment received from ${customerName} for policy ${policyNumber}.`,
      likelyCause: `Partial bank transfer or customer installment splitting may have caused the shortfall of ${formatINR(difference)}.`,
      financialImpact: `Outstanding deficit of ${formatINR(difference)}. Expected ${formatINR(expectedAmount)}, received ${formatINR(actualAmount)}.`,
      evidence: [
        `Expected premium: ${formatINR(expectedAmount)}`,
        `Actual received: ${formatINR(actualAmount)}`,
        `Net shortfall: ${formatINR(difference)}`,
      ],
      recommendedActions: [
        `Verify if a secondary transaction reference exists in payment gateway logs.`,
        `Check if customer ${customerName} submitted an installment arrangement request.`,
        `Issue a payment reminder for the remaining balance of ${formatINR(difference)}.`,
        `Confirm invoice allocation in BillingCenter accounts.`,
      ],
      confidence: 'HIGH',
    },
    OVERPAYMENT: {
      summary: `Excess remittance received from ${customerName} for policy ${policyNumber}.`,
      likelyCause: `Double payment attempt or gateway retry resulting in excess credit of ${formatINR(difference)}.`,
      financialImpact: `Unallocated surplus of ${formatINR(difference)}. Customer may be due a refund.`,
      evidence: [
        `Expected premium: ${formatINR(expectedAmount)}`,
        `Amount received: ${formatINR(actualAmount)}`,
        `Surplus: ${formatINR(difference)}`,
      ],
      recommendedActions: [
        `Apply ${formatINR(difference)} as advance premium credit for next billing cycle.`,
        `Verify customer preference for refund vs credit balance.`,
        `Generate surplus remittance receipt for accounting adjustment.`,
      ],
      confidence: 'HIGH',
    },
    MISSING_PAYMENT: {
      summary: `No payment recorded for policy ${policyNumber}. Full premium outstanding.`,
      likelyCause: `Auto-debit failure or NACH mandate revocation may have prevented payment collection.`,
      financialImpact: `Full premium of ${formatINR(expectedAmount)} remains outstanding.`,
      evidence: [
        `Invoice amount due: ${formatINR(expectedAmount)}`,
        `Payments received: ${formatINR(0)}`,
        `Days since due date may apply late fees.`,
      ],
      recommendedActions: [
        `Verify NACH/Auto-debit mandate status with banking provider.`,
        `Contact ${customerName} via SMS/email to collect dues.`,
        `Check if policy is approaching grace period expiration.`,
      ],
      confidence: 'MEDIUM',
    },
    DUPLICATE_PAYMENT: {
      summary: `Duplicate payment reference detected for policy ${policyNumber}.`,
      likelyCause: `Gateway retry collision or manual double submission caused duplicate transactions.`,
      financialImpact: `System over-collection of ${formatINR(difference)}.`,
      evidence: [
        `Multiple transactions with identical reference numbers detected.`,
        `Expected: ${formatINR(expectedAmount)}, Total received: ${formatINR(actualAmount)}`,
      ],
      recommendedActions: [
        `Initiate merchant refund request for the duplicate transaction.`,
        `Verify transaction IDs in the payment gateway portal.`,
        `Notify customer ${customerName} regarding automated refund processing.`,
      ],
      confidence: 'HIGH',
    },
    LATE_PAYMENT: {
      summary: `Payment received after invoice due date for policy ${policyNumber}.`,
      likelyCause: `Payment was processed after the stipulated due date.`,
      financialImpact: `Zero net balance impact. Potential late fee surcharge assessment.`,
      evidence: [
        `Full amount of ${formatINR(expectedAmount)} was received.`,
        `Payment date is after invoice due date.`,
      ],
      recommendedActions: [
        `Verify if grace period policy applies for this product type.`,
        `Confirm policy status remains ACTIVE in BillingCenter.`,
        `Log late payment pattern for risk scoring analytics.`,
      ],
      confidence: 'HIGH',
    },
    PAYMENT_FAILED: {
      summary: `Payment gateway rejection for policy ${policyNumber}.`,
      likelyCause: `Bank account decline or gateway timeout prevented successful collection.`,
      financialImpact: `Uncollected premium of ${formatINR(expectedAmount)}.`,
      evidence: [
        `Transaction attempt failed at gateway.`,
        `Amount due: ${formatINR(expectedAmount)}`,
      ],
      recommendedActions: [
        `Review gateway response code and error diagnostic payload.`,
        `Re-trigger auto-debit attempt or send payment retry link to ${customerName}.`,
        `Escalate to operations if payment failure recurs.`,
      ],
      confidence: 'MEDIUM',
    },
  };

  return analyses[type] || {
    summary: `Payment discrepancy detected for policy ${policyNumber}.`,
    likelyCause: 'Unknown cause. Manual investigation required.',
    financialImpact: `Difference of ${formatINR(difference)}.`,
    evidence: [`Expected: ${formatINR(expectedAmount)}`, `Actual: ${formatINR(actualAmount)}`],
    recommendedActions: ['Manual review required.'],
    confidence: 'LOW',
  };
}

export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  expectJSON = false
): Promise<string> {
  const aiClient = getAIClient();

  if (!aiClient) {
    console.log('[AI] No API key configured — using fallback mode.');
    throw new Error('AI_UNAVAILABLE');
  }

  // Append a JSON instruction to the system prompt instead of using
  // response_format: json_object, since many OpenRouter models don't support it.
  const finalSystemPrompt = expectJSON
    ? `${systemPrompt}\n\nIMPORTANT: Respond with valid JSON only. No markdown, no code fences, no extra text.`
    : systemPrompt;

  try {
    console.log(`[AI] Calling OpenRouter model: ${AI_MODEL} (max_tokens: ${env.OPENROUTER_MAX_TOKENS})`);
    const response = await aiClient.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: finalSystemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: env.OPENROUTER_MAX_TOKENS,
    });

    const content = response.choices[0]?.message?.content || '';
    console.log(`[AI] Response received (${content.length} chars).`);
    return content;
  } catch (error: any) {
    // Surface the real error so it appears in the backend terminal
    console.error('[AI] OpenRouter API error:', error?.message || error);
    if (error?.status) {
      console.error(`[AI] HTTP status: ${error.status} | Code: ${error?.error?.code}`);
    }
    throw error;
  }
}
