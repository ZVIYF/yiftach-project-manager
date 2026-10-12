# Migration & Operational Scripts

This directory contains standalone tools for ETL migration, integrity verification, and batch schema transitions.

## Scripts

### `migrate-legacy-data.ts`
Local ETL migration tool that maps legacy single-document JSON backups into normalized Cloud Firestore collections (`/projects`, `/finances`, `/debts`, `/allowed_users`, `/system/settings`).

#### Usage:
```bash
# Run validation and audit calculations without modifying Firestore:
npm run migrate:dry-run

# Run migration against default local backup (legacy/נתונים_פיננסיים/backup.json):
npm run migrate

# Run migration against a custom local JSON backup:
npm run migrate -- path/to/backup.json
```

### `legacy-mappers.ts`
Type-safe transformation functions converting legacy entities into strict domain models.
