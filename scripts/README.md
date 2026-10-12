# Migration & Maintenance Scripts

This directory contains standalone operational scripts for database migrations, integrity audits, and data reconciliation.

## Planned Scripts for Phase 2:
- `migrate-legacy-data.ts`: One-time ETL script reading the legacy single-document JSON state from Firestore (`shared/data`) and transforming records into normalized collections (`/projects`, `/finances`, `/debts`).

