export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ExceptionType = 
  | 'UNDERPAYMENT'
  | 'OVERPAYMENT'
  | 'MISSING_PAYMENT'
  | 'DUPLICATE_PAYMENT'
  | 'LATE_PAYMENT'
  | 'FAILED_PAYMENT';

export type ExceptionStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'ESCALATED';

export type ReconciliationMatchStatus = 'MATCHED' | ExceptionType;

export type PaymentMethod = 
  | 'UPI'
  | 'Credit Card'
  | 'Debit Card'
  | 'Bank Transfer'
  | 'Auto Debit'
  | 'Cheque';

export type PaymentStatus = 'Success' | 'Pending' | 'Failed' | 'Refunded';

export type PolicyStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';

export type InvoiceStatus = 'Paid' | 'Partially Paid' | 'Unpaid' | 'Overpaid';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Finance Analyst' | 'Operations User';
  avatar?: string;
}

export interface Policyholder {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Policy {
  id: string;
  policyNumber: string;
  customer: Policyholder;
  productType: 'Health Insurance' | 'Motor Insurance' | 'Term Life Insurance' | 'Commercial Property' | 'Home Insurance';
  annualPremium: number;
  monthlyPremium: number;
  billingFrequency: 'Monthly' | 'Quarterly' | 'Annual';
  effectiveDate: string;
  expirationDate: string;
  status: PolicyStatus;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  policyId: string;
  policyNumber: string;
  customerName: string;
  productType: string;
  dueDate: string;
  issueDate: string;
  expectedAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: InvoiceStatus;
  reconciliationStatus: ReconciliationMatchStatus;
}

export interface Payment {
  id: string;
  transactionId: string;
  policyId: string;
  policyNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  gatewayResponse?: string;
}

export interface ExceptionNote {
  id: string;
  timestamp: string;
  author: string;
  text: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  actor: string;
  title: string;
  description: string;
  type: 'CREATED' | 'ASSIGNED' | 'STATUS_CHANGE' | 'NOTE_ADDED' | 'RESOLVED' | 'AI_ANALYSIS';
}

export interface PaymentException {
  id: string;
  exceptionNumber: string; // e.g. EXC-00452
  type: ExceptionType;
  policyId: string;
  policyNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  paymentId?: string;
  transactionId?: string;
  customerName: string;
  productType: string;
  expectedAmount: number;
  actualAmount: number;
  differenceAmount: number;
  severity: Severity;
  assignee: string; // User name or 'Unassigned'
  status: ExceptionStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  notes: ExceptionNote[];
  timeline: TimelineEvent[];
}

export interface ReconciliationResult {
  invoiceId: string;
  invoiceNumber: string;
  policyNumber: string;
  customerName: string;
  expected: number;
  received: number;
  difference: number;
  status: ReconciliationMatchStatus;
  exceptionId?: string;
}

export interface ReconciliationRun {
  id: string;
  runNumber: string;
  timestamp: string;
  recordsProcessed: number;
  matchedCount: number;
  exceptionCount: number;
  totalDifference: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
  results: ReconciliationResult[];
}

export interface AIAnalysis {
  likelyCause: string;
  explanation: string;
  financialImpact: string;
  recommendedSteps: string[];
  confidenceScore: number;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  impactAmount?: number;
  affectedCount?: number;
  category: 'FINANCIAL' | 'EXCEPTION' | 'PAYMENT_BEHAVIOR' | 'ACTION_REQUIRED';
  severity: 'HIGH' | 'MEDIUM' | 'INFO';
  suggestedAction?: string;
}

export interface SystemSettings {
  theme: 'light' | 'dark' | 'system';
  lowSeverityThreshold: number; // e.g. 1000
  mediumSeverityThreshold: number; // e.g. 10000
  highSeverityThreshold: number; // e.g. 50000
  autoAssignExceptions: boolean;
}
