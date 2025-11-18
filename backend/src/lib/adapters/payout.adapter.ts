// Payout Adapter Interface

export interface PayoutRequest {
  recipientId: string;
  amount: number;
  currency: string;
  method: 'stripe' | 'paypal' | 'bank';
  accountDetails: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface PayoutResponse {
  success: boolean;
  transactionId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  estimatedArrival?: Date;
}

/**
 * Adapter interface for processing payouts
 * Implementations: Stripe Connect, PayPal Payouts, Bank Transfers, etc.
 */
export interface IPayoutAdapter {
  processPayout(request: PayoutRequest): Promise<PayoutResponse>;
  getPayoutStatus(transactionId: string): Promise<PayoutResponse>;
  cancelPayout(transactionId: string): Promise<boolean>;
}

/**
 * Stub implementation for testing/development
 */
export class StubPayoutAdapter implements IPayoutAdapter {
  private payouts: Map<string, PayoutResponse> = new Map();

  async processPayout(request: PayoutRequest): Promise<PayoutResponse> {
    console.log('[StubPayoutAdapter] Processing payout:', request);

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const response: PayoutResponse = {
      success: true,
      transactionId,
      status: 'processing',
      estimatedArrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    };

    this.payouts.set(transactionId, response);

    // Simulate async processing
    setTimeout(() => {
      const updated = this.payouts.get(transactionId);
      if (updated) {
        updated.status = 'completed';
        this.payouts.set(transactionId, updated);
      }
    }, 2000);

    return response;
  }

  async getPayoutStatus(transactionId: string): Promise<PayoutResponse> {
    const payout = this.payouts.get(transactionId);
    if (!payout) {
      return {
        success: false,
        status: 'failed',
        error: 'Payout not found',
      };
    }
    return payout;
  }

  async cancelPayout(transactionId: string): Promise<boolean> {
    const payout = this.payouts.get(transactionId);
    if (!payout || payout.status === 'completed') {
      return false;
    }
    this.payouts.delete(transactionId);
    return true;
  }

  getAllPayouts(): Map<string, PayoutResponse> {
    return this.payouts;
  }

  clear(): void {
    this.payouts.clear();
  }
}
