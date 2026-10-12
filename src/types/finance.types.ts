import { Identifiable, Timestamped } from './common.types';

/**
 * Supported classification types for cashflow transactions.
 */
export type TransactionType = 'income' | 'expense' | 'withdrawal' | 'reimbursement';

/**
 * Recognized owners / partners in the business.
 */
export type TransactionOwner = 'biz' | 'mandel' | 'avrumi' | string;

/**
 * Payment method used to execute the transaction.
 */
export type PaymentMethod = 'transfer' | 'check' | 'cash' | 'credit' | 'bit';

/**
 * Individual financial entry within the ledger.
 */
export interface FinancialTransaction extends Identifiable, Timestamped {
  date: string;
  amount: number;
  description: string;
  type: TransactionType;
  owner: TransactionOwner;
  projectId?: string;
  phaseId?: string;
  passThrough?: boolean;
  paidBy?: string;
  paidTo?: string;
  depositedTo?: string;
  paymentMethod?: PaymentMethod;
  receiptUrl?: string;
}

/**
 * Status indicator for debt tracking.
 */
export type DebtStatus = 'open' | 'settled' | 'partial';

/**
 * Record of debts owed by or to the business.
 */
export interface DebtRecord extends Identifiable, Timestamped {
  description: string;
  amount: number;
  owner: TransactionOwner;
  projectId?: string;
  status: DebtStatus;
  notes?: string;
}

