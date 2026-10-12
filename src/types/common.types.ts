/**
 * Generic Identifiable interface for all domain entities.
 */
export interface Identifiable {
  readonly id: string;
}

/**
 * Standard audit timestamps applied to all persistent records.
 */
export interface Timestamped {
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Represents operation outcomes across the domain.
 */
export type OperationResult<TData, TError = string> =
  | { success: true; data: TData }
  | { success: false; error: TError };

/**
 * Supported navigation tab identifiers in the application.
 */
export type NavigationTab =
  | 'dashboard'
  | 'projects'
  | 'finances'
  | 'debts'
  | 'quotes'
  | 'settings';

