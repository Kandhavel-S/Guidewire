import { create } from 'zustand';
import {
  User,
  Policy,
  Policyholder,
  Invoice,
  Payment,
  PaymentException,
  ReconciliationRun,
  SystemSettings,
  ExceptionStatus,
} from '@/types';
import { authApi } from '@/lib/api/auth';
import { policiesApi } from '@/lib/api/policies';
import { invoicesApi } from '@/lib/api/invoices';
import { paymentsApi } from '@/lib/api/payments';
import { exceptionsApi } from '@/lib/api/exceptions';
import { reconciliationApi } from '@/lib/api/reconciliation';

type ApiPolicy = Partial<Policy> & {
  policyholder?: Policyholder;
  policyType?: string;
  premiumAmount?: number | string;
};

function normalizePolicy(policy: ApiPolicy): Policy {
  const premiumAmount = Number(policy.premiumAmount ?? policy.annualPremium ?? 0);
  const billingFrequency = policy.billingFrequency ?? 'Annual';
  const customer = policy.customer ?? policy.policyholder ?? {
    id: '',
    name: 'Unknown customer',
    email: '',
    phone: '',
    address: '',
  };

  return {
    ...policy,
    customer,
    productType: (policy.productType ?? policy.policyType ?? 'Unknown') as Policy['productType'],
    annualPremium: Number(policy.annualPremium ?? premiumAmount),
    monthlyPremium: Number(
      policy.monthlyPremium ?? (billingFrequency === 'Monthly' ? premiumAmount : premiumAmount / 12)
    ),
    billingFrequency,
  } as Policy;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  theme: 'dark',
  lowSeverityThreshold: 1000,
  mediumSeverityThreshold: 10000,
  highSeverityThreshold: 50000,
  autoAssignExceptions: true,
};

interface AppState {
  currentUser: User | null;
  policies: Policy[];
  invoices: Invoice[];
  payments: Payment[];
  exceptions: PaymentException[];
  reconciliationRuns: ReconciliationRun[];
  settings: SystemSettings;
  nlSearchQuery: string;
  isInitializing: boolean;

  // Actions
  initializeStore: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  runReconciliation: () => Promise<ReconciliationRun | null>;
  updateExceptionStatus: (id: string, status: ExceptionStatus) => Promise<void>;
  assignException: (id: string, assignee: string) => Promise<void>;
  addExceptionNote: (id: string, text: string) => Promise<void>;
  resolveException: (id: string, note?: string) => Promise<void>;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetDemoData: () => Promise<void>;
  setNLSearchQuery: (query: string) => void;
  refreshData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  policies: [],
  invoices: [],
  payments: [],
  exceptions: [],
  reconciliationRuns: [],
  settings: DEFAULT_SETTINGS,
  nlSearchQuery: '',
  isInitializing: true,

  initializeStore: async () => {
    try {
      // Fetch authenticated user
      const authRes = await authApi.getMe();
      const currentUser = authRes.success ? authRes.data?.user : null;

      // Fetch initial dataset from APIs
      const [polRes, invRes, payRes, excRes, runRes] = await Promise.all([
        policiesApi.getPolicies({ limit: 100 }),
        invoicesApi.getInvoices({ limit: 100 }),
        paymentsApi.getPayments({ limit: 100 }),
        exceptionsApi.getExceptions({ limit: 100 }),
        reconciliationApi.getRuns({ limit: 50 }),
      ]);

      set({
        currentUser,
        policies: (polRes.data || []).map(normalizePolicy),
        invoices: invRes.data || [],
        payments: payRes.data || [],
        exceptions: excRes.data || [],
        reconciliationRuns: runRes.data || [],
        isInitializing: false,
      });
    } catch (error) {
      console.error('[Store] Initialization error:', error);
      set({ isInitializing: false });
    }
  },

  refreshData: async () => {
    try {
      const [polRes, invRes, payRes, excRes, runRes] = await Promise.all([
        policiesApi.getPolicies({ limit: 100 }),
        invoicesApi.getInvoices({ limit: 100 }),
        paymentsApi.getPayments({ limit: 100 }),
        exceptionsApi.getExceptions({ limit: 100 }),
        reconciliationApi.getRuns({ limit: 50 }),
      ]);

      set({
        policies: (polRes.data || []).map(normalizePolicy),
        invoices: invRes.data || [],
        payments: payRes.data || [],
        exceptions: excRes.data || [],
        reconciliationRuns: runRes.data || [],
      });
    } catch (error) {
      console.error('[Store] Refresh error:', error);
    }
  },

  login: async (email, password) => {
    const res = await authApi.login(email, password);
    if (res.success && res.data?.user) {
      set({ currentUser: res.data.user });
      await get().refreshData();
      return true;
    }
    return false;
  },

  logout: async () => {
    await authApi.logout();
    set({ currentUser: null });
  },

  runReconciliation: async () => {
    const res = await reconciliationApi.startReconciliation();
    if (res.success && res.data) {
      await get().refreshData();
      return res.data;
    }
    return null;
  },

  updateExceptionStatus: async (id, status) => {
    const res = await exceptionsApi.updateStatus(id, status);
    if (res.success) {
      await get().refreshData();
    }
  },

  assignException: async (id, assigneeId) => {
    const res = await exceptionsApi.assignException(id, assigneeId);
    if (res.success) {
      await get().refreshData();
    }
  },

  addExceptionNote: async (id, text) => {
    const res = await exceptionsApi.addNote(id, text);
    if (res.success) {
      await get().refreshData();
    }
  },

  resolveException: async (id, noteText) => {
    const res = await exceptionsApi.resolveException(id, noteText);
    if (res.success) {
      await get().refreshData();
    }
  },

  updateSettings: (newSettings) => {
    const { settings } = get();
    const updated = { ...settings, ...newSettings };
    set({ settings: updated });
  },

  resetDemoData: async () => {
    await get().refreshData();
  },

  setNLSearchQuery: (query) => {
    set({ nlSearchQuery: query });
  },
}));
