import { collection, doc, getDocs, setDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { getFirestoreDb } from '../../core/firebase';
import { DebtRecord, DebtStatus } from '../../types/finance.types';
import { OperationResult } from '../../types/common.types';

/**
 * Service managing Debt records in Cloud Firestore.
 */
export class DebtsService {
  private readonly collectionName = 'debts';

  /**
   * Retrieves all debt records.
   */
  public async getDebts(): Promise<OperationResult<DebtRecord[]>> {
    try {
      const db = getFirestoreDb();
      const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      const debts: DebtRecord[] = snapshot.docs.map((d) => d.data() as DebtRecord);
      return { success: true, data: debts };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to retrieve debts',
      };
    }
  }

  /**
   * Creates a new debt entry.
   */
  public async createDebt(
    payload: Omit<DebtRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<OperationResult<DebtRecord>> {
    try {
      const db = getFirestoreDb();
      const id = `debt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();

      const debt: DebtRecord = {
        ...payload,
        id,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(doc(db, this.collectionName, id), debt);
      return { success: true, data: debt };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to create debt record',
      };
    }
  }

  /**
   * Toggles the settlement status of a debt.
   */
  public async setDebtStatus(debtId: string, status: DebtStatus): Promise<OperationResult<void>> {
    try {
      const db = getFirestoreDb();
      await updateDoc(doc(db, this.collectionName, debtId), {
        status,
        updatedAt: new Date().toISOString(),
      });
      return { success: true, data: undefined };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to update debt status',
      };
    }
  }
}

export const debtsService = new DebtsService();
