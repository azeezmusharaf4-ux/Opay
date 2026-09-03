import crypto from 'crypto';

export interface PaystackResolveResult {
  success: boolean;
  accountNumber?: string;
  accountName?: string;
  bankId?: number;
  message?: string;
}

export interface PaystackBank {
  name: string;
  code: string;
  slug: string;
  active: boolean;
  is_deleted?: boolean;
  type?: string;
  id?: number;
}

export interface PaystackInitResult {
  success: boolean;
  authorizationUrl?: string;
  accessCode?: string;
  reference?: string;
  message?: string;
}

export interface PaystackVerifyResult {
  success: boolean;
  status?: string;
  amountNgn?: number;
  reference?: string;
  channel?: string;
  paidAt?: string;
  customer?: {
    email: string;
    name?: string;
    phone?: string;
  };
  metadata?: Record<string, unknown>;
  message?: string;
}

export interface PaystackTransferResult {
  success: boolean;
  status: 'completed' | 'pending' | 'failed' | 'reversed';
  reference?: string;
  transferCode?: string;
  message?: string;
  rawStatus?: string;
}

export class PaystackService {
  private static getSecretKey(): string | null {
    const key = process.env.PAYSTACK_SECRET_KEY?.trim();
    return key && key.length > 0 ? key : null;
  }

  public static isConfigured(): boolean {
    return this.getSecretKey() !== null;
  }

  private static getHeaders() {
    const secret = this.getSecretKey();
    if (!secret) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured in the server environment.');
    }
    return {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  /**
   * Resolve a Nigerian bank account number to get the account holder's name
   */
  public static async resolveAccount(
    accountNumber: string,
    bankCode: string
  ): Promise<PaystackResolveResult> {
    const secret = this.getSecretKey();
    if (!secret) {
      return {
        success: false,
        message: 'Paystack is not configured. Using fallback resolution.',
      };
    }

    try {
      const cleanAccount = accountNumber.trim().replace(/\D/g, '');
      const cleanBankCode = bankCode.trim();

      const url = `https://api.paystack.co/bank/resolve?account_number=${encodeURIComponent(cleanAccount)}&bank_code=${encodeURIComponent(cleanBankCode)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (response.ok && data.status && data.data) {
        return {
          success: true,
          accountNumber: data.data.account_number || cleanAccount,
          accountName: (data.data.account_name || '').toUpperCase().trim(),
          bankId: data.data.bank_id,
        };
      }

      return {
        success: false,
        message: data.message || 'Could not resolve account with Paystack.',
      };
    } catch (err: unknown) {
      console.error('Paystack resolve account error:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Network error communicating with Paystack.',
      };
    }
  }

  /**
   * Fetch all Nigerian banks from Paystack
   */
  public static async listBanks(): Promise<PaystackBank[]> {
    const secret = this.getSecretKey();
    if (!secret) {
      return [];
    }

    try {
      const response = await fetch('https://api.paystack.co/bank?country=nigeria&perPage=100', {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const data = await response.json();
      if (response.ok && data.status && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    } catch (err) {
      console.error('Paystack list banks error:', err);
      return [];
    }
  }

  /**
   * Initialize a payment transaction on Paystack
   * @param amountNgn Amount in Naira (e.g. 5000)
   */
  public static async initializeTransaction(params: {
    amountNgn: number;
    email: string;
    reference?: string;
    callbackUrl?: string;
    metadata?: Record<string, unknown>;
  }): Promise<PaystackInitResult> {
    const secret = this.getSecretKey();
    if (!secret) {
      return {
        success: false,
        message: 'Paystack is not configured on the server.',
      };
    }

    try {
      // Paystack expects amount in Kobo (1 NGN = 100 Kobo)
      const amountInKobo = Math.round(params.amountNgn * 100);

      const payload: Record<string, unknown> = {
        amount: amountInKobo,
        email: params.email,
        currency: 'NGN',
      };

      if (params.reference) payload.reference = params.reference;
      if (params.callbackUrl) payload.callback_url = params.callbackUrl;
      if (params.metadata) payload.metadata = params.metadata;

      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.status && data.data) {
        return {
          success: true,
          authorizationUrl: data.data.authorization_url,
          accessCode: data.data.access_code,
          reference: data.data.reference,
        };
      }

      return {
        success: false,
        message: data.message || 'Failed to initialize Paystack transaction.',
      };
    } catch (err: unknown) {
      console.error('Paystack initialize error:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Error initializing Paystack payment.',
      };
    }
  }

  /**
   * Verify a transaction after payment completion
   */
  public static async verifyTransaction(reference: string): Promise<PaystackVerifyResult> {
    const secret = this.getSecretKey();
    if (!secret) {
      return {
        success: false,
        message: 'Paystack is not configured on the server.',
      };
    }

    try {
      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference.trim())}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      const data = await response.json();

      if (response.ok && data.status && data.data) {
        const txData = data.data;
        const amountNgn = typeof txData.amount === 'number' ? txData.amount / 100 : 0;

        return {
          success: txData.status === 'success',
          status: txData.status,
          amountNgn,
          reference: txData.reference,
          channel: txData.channel,
          paidAt: txData.paid_at,
          customer: {
            email: txData.customer?.email || '',
            name: `${txData.customer?.first_name || ''} ${txData.customer?.last_name || ''}`.trim(),
            phone: txData.customer?.phone || '',
          },
          metadata: txData.metadata,
        };
      }

      return {
        success: false,
        message: data.message || 'Transaction could not be verified.',
      };
    } catch (err: unknown) {
      console.error('Paystack verify error:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Error verifying Paystack payment.',
      };
    }
  }

  /**
   * Create a transfer recipient on Paystack
   */
  public static async createTransferRecipient(params: {
    name: string;
    accountNumber: string;
    bankCode: string;
  }): Promise<{ success: boolean; recipientCode?: string; message?: string }> {
    const secret = this.getSecretKey();
    if (!secret) return { success: false, message: 'Paystack is not configured.' };

    try {
      const response = await fetch('https://api.paystack.co/transferrecipient', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          type: 'nuban',
          name: params.name,
          account_number: params.accountNumber.trim().replace(/\D/g, ''),
          bank_code: params.bankCode.trim(),
          currency: 'NGN',
        }),
      });

      const data = await response.json();
      if (response.ok && data.status && data.data?.recipient_code) {
        return {
          success: true,
          recipientCode: data.data.recipient_code,
        };
      }
      return {
        success: false,
        message: data.message || 'Could not create transfer recipient.',
      };
    } catch (err) {
      console.error('Paystack recipient creation error:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Error creating transfer recipient.',
      };
    }
  }

  /**
   * Initiate a transfer to a recipient via Paystack
   */
  public static async initiateTransfer(params: {
    amountNgn: number;
    recipientCode: string;
    reason?: string;
    reference?: string;
  }): Promise<PaystackTransferResult> {
    const secret = this.getSecretKey();
    if (!secret) {
      return {
        success: false,
        status: 'failed',
        message: 'Paystack is not configured.',
      };
    }

    try {
      const amountKobo = Math.round(params.amountNgn * 100);
      const payload: Record<string, unknown> = {
        source: 'balance',
        amount: amountKobo,
        recipient: params.recipientCode,
        reason: params.reason || 'OPay Bank Transfer',
      };
      if (params.reference) payload.reference = params.reference;

      const response = await fetch('https://api.paystack.co/transfer', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.status && data.data) {
        const rawStatus = (data.data.status || 'success').toLowerCase();
        let mappedStatus: 'completed' | 'pending' | 'failed' | 'reversed' = 'pending';

        if (rawStatus === 'success' || rawStatus === 'successful') {
          mappedStatus = 'completed';
        } else if (rawStatus === 'failed') {
          mappedStatus = 'failed';
        } else if (rawStatus === 'reversed') {
          mappedStatus = 'reversed';
        } else {
          mappedStatus = 'pending';
        }

        return {
          success: mappedStatus === 'completed' || mappedStatus === 'pending',
          status: mappedStatus,
          reference: data.data.reference || params.reference,
          transferCode: data.data.transfer_code,
          rawStatus: data.data.status,
          message: data.message || 'Transfer initiated successfully.',
        };
      }

      return {
        success: false,
        status: 'failed',
        message: data.message || 'Transfer failed on Paystack.',
      };
    } catch (err: unknown) {
      console.error('Paystack transfer error:', err);
      return {
        success: false,
        status: 'failed',
        message: err instanceof Error ? err.message : 'Error initiating Paystack transfer.',
      };
    }
  }

  /**
   * Verify incoming Webhook HMAC signature from Paystack
   */
  public static verifyWebhookSignature(payload: string, signature: string): boolean {
    const secret = this.getSecretKey();
    if (!secret || !signature) return false;

    try {
      const hash = crypto
        .createHmac('sha512', secret)
        .update(payload)
        .digest('hex');
      return hash === signature;
    } catch (err) {
      console.error('Webhook signature verification error:', err);
      return false;
    }
  }
}
