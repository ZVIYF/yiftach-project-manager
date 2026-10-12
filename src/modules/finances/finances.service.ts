import { collection, doc, getDocs, setDoc, query, orderBy } from 'firebase/firestore';
import { getFirestoreDb } from '../../core/firebase';
import { FinancialTransaction } from '../../types/finance.types';
import { OperationResult } from '../../types/common.types';

export interface FinanceSummaryMetrics {
  totalIncome: number;
  realExpenses: number;
  passThroughExpenses: number;
  netProfit: number;
  partnerWithdrawals: Record<string, number>;
}

/**
 * Service managing Financial ledger transactions and accounting summaries.
 */
export class FinancesService {
  private readonly collectionName = 'finances';

  /**
   * Retrieves all financial transactions sorted by date descending.
   */
  public async getTransactions(): Promise<OperationResult<FinancialTransaction[]>> {
    try {
      const db = getFirestoreDb();
      const q = query(collection(db, this.collectionName), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);

      const transactions: FinancialTransaction[] = snapshot.docs.map((d) => d.data() as FinancialTransaction);
      return { success: true, data: transactions };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to retrieve transactions',
      };
    }
  }

  /**
   * Records a new transaction in Firestore.
   */
  public async createTransaction(
    payload: Omit<FinancialTransaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<OperationResult<FinancialTransaction>> {
    try {
      const db = getFirestoreDb();
      const id = `fin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();

      const transaction: FinancialTransaction = {
        ...payload,
        id,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(doc(db, this.collectionName, id), transaction);
      return { success: true, data: transaction };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to record transaction',
      };
    }
  }

  /**
   * Computes ledger summaries respecting pass-through exclusions and partner splits.
   */
  public calculateMetrics(transactions: FinancialTransaction[]): FinanceSummaryMetrics {
    let totalIncome = 0;
    let realExpenses = 0;
    let passThroughExpenses = 0;
    const partnerWithdrawals: Record<string, number> = { mandel: 0, avrumi: 0 };

    transactions.forEach((tx) => {
      const amount = tx.amount || 0;
      if (tx.type === 'income') {
        totalIncome += amount;
      } else if (tx.type === 'expense') {
        if (tx.passThrough) {
          passThroughExpenses += amount;
        } else {
          realExpenses += amount;
        }
      } else if (tx.type === 'withdrawal') {
        const owner = (tx.owner as string) || 'biz';
        partnerWithdrawals[owner] = (partnerWithdrawals[owner] || 0) + amount;
      }
    });

    const netProfit = totalIncome - realExpenses;

    return {
      totalIncome,
      realExpenses,
      passThroughExpenses,
      netProfit,
      partnerWithdrawals,
    };
  }
}

export const financesService = new FinancesService();
