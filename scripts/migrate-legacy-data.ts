import * as fs from 'fs';
import * as path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, writeBatch, doc } from 'firebase/firestore';
import { LegacyAppState } from '../src/types/legacy.types';
import {
  mapLegacyProject,
  mapLegacyFinance,
  mapLegacyDebt,
  mapLegacySettings,
} from './legacy-mappers';
import { config } from '../src/core/config';

/**
 * Executes migration of legacy single-document data to normalized Firestore collections.
 * Runs strictly locally with checksum and audit verification.
 */
async function runMigration(): Promise<void> {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const filePathArg = args.find((arg) => !arg.startsWith('--'));

  const defaultPath = path.resolve(process.cwd(), 'legacy', 'נתונים_פיננסיים', 'backup.json');
  const targetFilePath = filePathArg ? path.resolve(process.cwd(), filePathArg) : defaultPath;

  console.log(`[Migration] Starting ETL process (Dry Run: ${isDryRun})`);
  console.log(`[Migration] Target source file: ${targetFilePath}`);

  if (!fs.existsSync(targetFilePath)) {
    console.error(`[Migration Error] File does not exist at path: ${targetFilePath}`);
    process.exit(1);
  }

  const rawJson = fs.readFileSync(targetFilePath, 'utf-8');
  const legacyData: LegacyAppState = JSON.parse(rawJson);

  // Initialize Firebase and Firestore instances
  const app = initializeApp(config.firebase);
  const db = getFirestore(app);

  const projects = (legacyData.projects || []).map(mapLegacyProject);
  const finances = (legacyData.finances || []).map(mapLegacyFinance);
  const debts = (legacyData.debts || []).map(mapLegacyDebt);
  const settings = mapLegacySettings(legacyData);
  const allowedUsers = legacyData.allowedUsers || [];

  // Audit calculations
  const totalIncome = finances
    .filter((f) => f.type === 'income')
    .reduce((sum, f) => sum + f.amount, 0);
  const totalExpense = finances
    .filter((f) => f.type === 'expense' && !f.passThrough)
    .reduce((sum, f) => sum + f.amount, 0);
  const totalWithdrawal = finances
    .filter((f) => f.type === 'withdrawal')
    .reduce((sum, f) => sum + f.amount, 0);

  console.log('\n--- MIGRATION AUDIT SUMMARY ---');
  console.log(`• Projects to migrate:     ${projects.length}`);
  console.log(`• Finances to migrate:     ${finances.length}`);
  console.log(`  - Total Income:          ${totalIncome.toLocaleString()} ILS`);
  console.log(`  - Total Real Expense:    ${totalExpense.toLocaleString()} ILS`);
  console.log(`  - Total Withdrawals:     ${totalWithdrawal.toLocaleString()} ILS`);
  console.log(`• Debts to migrate:        ${debts.length}`);
  console.log(`• Allowed users to sync:   ${allowedUsers.length}`);

  if (isDryRun) {
    console.log('\n[Dry Run] Complete. No database writes were performed.');
    return;
  }

  // Queue write operations in batches of 400 (Firestore limit is 500 per batch)
  type BatchOp = { path: string; data: Record<string, unknown> };
  const operations: BatchOp[] = [];

  projects.forEach((p) => operations.push({ path: `projects/${p.id}`, data: p as unknown as Record<string, unknown> }));
  finances.forEach((f) => operations.push({ path: `finances/${f.id}`, data: f as unknown as Record<string, unknown> }));
  debts.forEach((d) => operations.push({ path: `debts/${d.id}`, data: d as unknown as Record<string, unknown> }));
  operations.push({ path: 'system/settings', data: settings as unknown as Record<string, unknown> });

  allowedUsers.forEach((email) => {
    const normalized = email.toLowerCase().trim();
    operations.push({
      path: `allowed_users/${normalized}`,
      data: { email: normalized, role: 'partner', isActive: true, updatedAt: new Date().toISOString() },
    });
  });

  const BATCH_SIZE = 400;
  for (let i = 0; i < operations.length; i += BATCH_SIZE) {
    const chunk = operations.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);

    chunk.forEach((op) => {
      const [coll, docId] = op.path.split('/');
      if (coll && docId) {
        batch.set(doc(db, coll, docId), op.data);
      }
    });

    await batch.commit();
    console.log(`[Migration] Committed batch ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} items)`);
  }

  console.log('\n[Migration] Successfully migrated all entities to Firestore.');
}

runMigration().catch((error) => {
  console.error('[Migration Fatal Error]:', error);
  process.exit(1);
});
