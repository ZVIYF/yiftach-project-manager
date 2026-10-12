import {
  LegacyProjectEntry,
  LegacyFinanceEntry,
  LegacyDebtEntry,
  LegacyAppState,
} from '../src/types/legacy.types';
import { Project, ProjectPhase, ProjectStatus } from '../src/types/project.types';
import { FinancialTransaction, DebtRecord, TransactionType, TransactionOwner } from '../src/types/finance.types';
import { SystemSettings, BusinessProfile } from '../src/types/partner.types';

/**
 * Maps a legacy project record to the normalized Project entity.
 */
export function mapLegacyProject(entry: LegacyProjectEntry): Project {
  const projectId = entry.id || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const phases: ProjectPhase[] = (entry.phases || []).map((phase, index) => ({
    id: phase.id || `phase_${index + 1}`,
    name: phase.name || `שלב ${index + 1}`,
    orderIndex: phase.order ?? index,
    isCompleted: Boolean(phase.done),
  }));

  const validStatuses: ProjectStatus[] = ['draft', 'active', 'completed', 'paused'];
  const status: ProjectStatus = validStatuses.includes(entry.status as ProjectStatus)
    ? (entry.status as ProjectStatus)
    : 'active';

  return {
    id: projectId,
    name: entry.name || 'פרויקט ללא שם',
    clientName: entry.client || entry.clientName || 'לקוח',
    clientPhone: entry.phone || entry.clientPhone || undefined,
    address: entry.address || undefined,
    status,
    phases,
    budgetTotal: Number(entry.budgetTotal || 0),
    shareToken: entry.shareToken || undefined,
    shareOptions: entry.shareOptions || undefined,
    driveFolderId: entry.driveFolderId || undefined,
    createdAt: entry.createdAt || now,
    updatedAt: now,
  };
}

/**
 * Maps a legacy financial transaction to the normalized FinancialTransaction entity.
 */
export function mapLegacyFinance(entry: LegacyFinanceEntry): FinancialTransaction {
  const transactionId = entry.id || `fin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const validTypes: TransactionType[] = ['income', 'expense', 'withdrawal', 'reimbursement'];
  const type: TransactionType = validTypes.includes(entry.type as TransactionType)
    ? (entry.type as TransactionType)
    : 'expense';

  return {
    id: transactionId,
    date: entry.date || now.split('T')[0] || '',
    amount: Number(entry.amount || 0),
    description: entry.desc || '',
    type,
    owner: (entry.owner as TransactionOwner) || 'biz',
    projectId: entry.proj && entry.proj !== 'biz' ? entry.proj : undefined,
    phaseId: entry.phaseId || undefined,
    passThrough: Boolean(entry.passThrough),
    paidBy: entry.paidBy || entry.paidFrom || undefined,
    paidTo: entry.paidTo || undefined,
    depositedTo: entry.depositedTo || undefined,
    paymentMethod: (entry.paymentMethod as FinancialTransaction['paymentMethod']) || 'transfer',
    receiptUrl: entry.receipt || undefined,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Maps a legacy debt entry to the normalized DebtRecord entity.
 */
export function mapLegacyDebt(entry: LegacyDebtEntry): DebtRecord {
  const debtId = entry.id || `debt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  return {
    id: debtId,
    description: entry.desc || '',
    amount: Number(entry.amount || 0),
    owner: (entry.owner as TransactionOwner) || 'biz',
    projectId: entry.proj && entry.proj !== 'biz' ? entry.proj : undefined,
    status: entry.status === 'settled' ? 'settled' : 'open',
    notes: entry.note || undefined,
    createdAt: entry.createdAt || now,
    updatedAt: now,
  };
}

/**
 * Maps global settings and business profile from legacy state.
 */
export function mapLegacySettings(legacy: LegacyAppState): SystemSettings {
  const legacyBiz = legacy.businessInfo || {};
  const businessProfile: BusinessProfile = {
    businessName: legacyBiz.ownerName || 'יפתח פרויקטים',
    taxId: legacyBiz.vatNumber || '',
    address: legacyBiz.address || '',
    phone: legacyBiz.phone || '',
    taxType: legacyBiz.vatType === 'murshe' ? 'authorized_dealer' : 'exempt_dealer',
    bankName: legacyBiz.bankName || undefined,
    bankBranch: legacyBiz.bankBranch || undefined,
    bankAccountNumber: legacyBiz.bankAccount || undefined,
  };

  return {
    vatRatePercentage: Number(legacy.vatRate ?? 18),
    partners: legacy.partnerNames || { mandel: 'מנדל', avrumi: 'אברומי' },
    businessProfile,
  };
}
