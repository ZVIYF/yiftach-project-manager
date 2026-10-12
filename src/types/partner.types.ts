/**
 * Business Partner definition.
 */
export interface PartnerProfile {
  readonly id: string;
  readonly displayName: string;
  readonly email?: string;
  readonly isActive: boolean;
}

/**
 * Company legal and financial metadata.
 */
export interface BusinessProfile {
  readonly businessName: string;
  readonly taxId: string;
  readonly address: string;
  readonly phone: string;
  readonly taxType: 'authorized_dealer' | 'exempt_dealer' | 'company';
  readonly bankName?: string;
  readonly bankBranch?: string;
  readonly bankAccountNumber?: string;
}

/**
 * Global application accounting and system settings.
 */
export interface SystemSettings {
  readonly vatRatePercentage: number;
  readonly partners: Record<string, string>;
  readonly businessProfile: BusinessProfile;
  readonly defaultPaymentTermsDays?: number;
}
