import { Identifiable, Timestamped } from './common.types';

/**
 * Status lifecycle of a construction project.
 */
export type ProjectStatus = 'draft' | 'active' | 'completed' | 'paused';

/**
 * Represents a milestone or phase within a construction project.
 */
export interface ProjectPhase extends Identifiable {
  name: string;
  orderIndex: number;
  isCompleted: boolean;
  targetDate?: string;
}

/**
 * Core Project entity definition.
 */
export interface Project extends Identifiable, Timestamped {
  name: string;
  clientName: string;
  clientPhone?: string;
  address?: string;
  status: ProjectStatus;
  phases: ProjectPhase[];
  budgetTotal: number;
  shareToken?: string;
  shareOptions?: string[];
  driveFolderId?: string;
}

/**
 * Line item in a customer construction quote.
 */
export interface QuoteItem extends Identifiable {
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/**
 * Formal project quote generated for customers.
 */
export interface ProjectQuote extends Identifiable, Timestamped {
  projectId: string;
  title: string;
  items: QuoteItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
}

