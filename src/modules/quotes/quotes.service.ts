import { QuoteItem } from '../../types/project.types';

export interface QuoteCalculationResult {
  subtotal: number;
  vatAmount: number;
  totalWithVat: number;
}

/**
 * Service managing Quote item calculations and VAT transformations.
 */
export class QuotesService {
  private readonly defaultVatRate = 0.18;

  /**
   * Calculates totals and VAT across a set of quote line items.
   */
  public calculateQuoteTotals(
    items: QuoteItem[],
    includeVat: boolean = true,
    vatRate: number = this.defaultVatRate
  ): QuoteCalculationResult {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const vatAmount = includeVat ? Math.round(subtotal * vatRate) : 0;
    const totalWithVat = subtotal + vatAmount;

    return {
      subtotal,
      vatAmount,
      totalWithVat,
    };
  }

  /**
   * Formats quote summary into a clean WhatsApp text representation.
   */
  public formatQuoteForWhatsApp(projectTitle: string, items: QuoteItem[], includeVat: boolean): string {
    const { subtotal, vatAmount, totalWithVat } = this.calculateQuoteTotals(items, includeVat);
    let msg = `*הצעת מחיר: ${projectTitle}*\n------------------------\n`;

    items.forEach((item, idx) => {
      const lineTotal = item.quantity * item.unitPrice;
      msg += `${idx + 1}. ${item.description} - ${item.quantity} ${item.unit} x ${item.unitPrice} ₪ = ${lineTotal.toLocaleString()} ₪\n`;
    });

    msg += `------------------------\n`;
    msg += `סה"כ לפני מע"מ: ${subtotal.toLocaleString()} ₪\n`;
    if (includeVat) {
      msg += `מע"מ (18%): ${vatAmount.toLocaleString()} ₪\n`;
      msg += `*סה"כ לתשלום: ${totalWithVat.toLocaleString()} ₪*\n`;
    }

    return encodeURIComponent(msg);
  }
}

export const quotesService = new QuotesService();
