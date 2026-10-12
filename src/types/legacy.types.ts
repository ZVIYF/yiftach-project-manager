/**
 * TypeScript contract representing legacy single-document state entries.
 * Used exclusively for type-safe parsing and migration of legacy records.
 */

export interface LegacyFinanceEntry {
  id?: string;
  date?: string;
  amount?: number | string;
  desc?: string;
  type?: 'income' | 'expense' | 'withdrawal' | 'reimbursement';
  owner?: string;
  proj?: string;
  phaseId?: string;
  passThrough?: boolean;
  paidBy?: string;
  paidFrom?: string;
  paidTo?: string;
  depositedTo?: string;
  paymentMethod?: string;
  receipt?: string | null;
  fromDebt?: string;
  fromCredit?: string;
  creditDeducted?: number;
  settled?: boolean;
  settledAt?: string;
}

export interface LegacyDebtEntry {
  id?: string;
  desc?: string;
  amount?: number | string;
  owner?: string;
  proj?: string;
  status?: string;
  note?: string;
  createdAt?: string;
}

export interface LegacyProjectPhaseEntry {
  id?: string;
  name?: string;
  order?: number;
  done?: boolean;
}

export interface LegacyQuoteLineEntry {
  id?: string;
  desc?: string;
  unit?: string;
  qty?: number;
  price?: number;
  total?: number;
}

export interface LegacyQuoteEntry {
  id?: string;
  title?: string;
  lines?: LegacyQuoteLineEntry[];
  includeVat?: boolean;
  notes?: string;
}

export interface LegacyProjectEntry {
  id?: string;
  name?: string;
  client?: string;
  clientName?: string;
  phone?: string;
  clientPhone?: string;
  address?: string;
  status?: string;
  phases?: LegacyProjectPhaseEntry[];
  quotes?: LegacyQuoteEntry[];
  budgetTotal?: number;
  shareToken?: string;
  shareOptions?: string[];
  driveFolderId?: string;
  createdAt?: string;
}

export interface LegacyBusinessInfo {
  ownerName?: string;
  vatNumber?: string;
  address?: string;
  phone?: string;
  vatType?: string;
  bankName?: string;
  bankBranch?: string;
  bankAccount?: string;
}

export interface LegacyAppState {
  projects?: LegacyProjectEntry[];
  finances?: LegacyFinanceEntry[];
  debts?: LegacyDebtEntry[];
  partnerNames?: Record<string, string>;
  businessInfo?: LegacyBusinessInfo;
  vatRate?: number;
  allowedUsers?: string[];
}
