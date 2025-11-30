import {
  FlutterwaveChargeRequest,
  FlutterwaveResponse,
  FlutterwaveVerificationResponse,
  PaymentStatus
} from '../types/payment';

// Flutterwave Payment Service Configuration
interface FlutterwaveConfig {
  publicKey: string;
  secretKey: string;
  encryptionKey: string;
  baseUrl: string;
  sandbox: boolean;
  timeout: number;
}

class FlutterwavePaymentService {
  private config: FlutterwaveConfig;

  constructor() {
    this.config = {
      publicKey: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-e7b862d8ff9c4b889410f6e179914598-X',
      secretKey: import.meta.env.VITE_FLUTTERWAVE_SECRET_KEY || 'FLWSECK_TEST-HfoDt2LuKjp1LrUitEN4kqIRW2G71q6i',
      encryptionKey: import.meta.env.VITE_FLUTTERWAVE_ENCRYPTION_KEY || 'njuGc1NVPaKPFE9iW/c/Bx52Ya96HeXkk8Gm9kRzH70=',
      baseUrl: import.meta.env.VITE_FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com/v3',
      sandbox: import.meta.env.VITE_FLUTTERWAVE_SANDBOX !== 'false',
      timeout: 30000
    };
  }

  /**
   * Generate transaction reference
   */
  generateTxRef(): string {
    return `benirage_donation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Process card payment through Flutterwave
   */
  async processCardPayment(
    amount: number,
    currency: string,
    cardData: {
      card_number: string;
      cvv: string;
      expiry_month: string;
      expiry_year: string;
    },
    customerData: {
      email: string;
      fullname?: string;
      phone_number?: string;
    },
    txRef?: string
  ): Promise<{ success: boolean; response?: FlutterwaveResponse; error?: string }> {
    try {
      const transactionRef = txRef || this.generateTxRef();

      const payload: FlutterwaveChargeRequest = {
        card_number: cardData.card_number,
        cvv: cardData.cvv,
        expiry_month: cardData.expiry_month,
        expiry_year: cardData.expiry_year,
        currency: currency.toUpperCase(),
        amount: amount,
        email: customerData.email,
        fullname: customerData.fullname,
        phone_number: customerData.phone_number,
        tx_ref: transactionRef,
        redirect_url: `${window.location.origin}/donation/callback`,
        payment_type: 'card',
        enctype: 'utf8'
      };

      const response = await this.makeRequest('/payments', payload, 'POST');
      
      return {
        success: true,
        response: response as FlutterwaveResponse
      };
    } catch (error) {
      console.error('Flutterwave card payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Card payment failed'
      };
    }
  }

  /**
   * Process mobile money payment through Flutterwave
   */
  async processMobileMoneyPayment(
    amount: number,
    currency: string,
    phoneNumber: string,
    network: string, // 'MTN', 'VODAFONE', 'AIRTELTIGO'
    customerData: {
      email: string;
      fullname?: string;
    },
    txRef?: string
  ): Promise<{ success: boolean; response?: FlutterwaveResponse; error?: string }> {
    try {
      const transactionRef = txRef || this.generateTxRef();

      const payload: FlutterwaveChargeRequest = {
        currency: currency.toUpperCase(),
        amount: amount,
        email: customerData.email,
        fullname: customerData.fullname,
        phone_number: phoneNumber,
        tx_ref: transactionRef,
        redirect_url: `${window.location.origin}/donation/callback`,
        payment_type: 'mobilemoney',
        network: network.toUpperCase()
      };

      const response = await this.makeRequest('/charges?type=mobile_money_rwanda', payload, 'POST');
      
      return {
        success: true,
        response: response as FlutterwaveResponse
      };
    } catch (error) {
      console.error('Flutterwave mobile money payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Mobile money payment failed'
      };
    }
  }

  /**
   * Process bank transfer payment through Flutterwave
   */
  async processBankTransferPayment(
    amount: number,
    currency: string,
    customerData: {
      email: string;
      fullname?: string;
    },
    txRef?: string
  ): Promise<{ success: boolean; response?: FlutterwaveResponse; error?: string }> {
    try {
      const transactionRef = txRef || this.generateTxRef();

      const payload: FlutterwaveChargeRequest = {
        currency: currency.toUpperCase(),
        amount: amount,
        email: customerData.email,
        fullname: customerData.fullname,
        tx_ref: transactionRef,
        redirect_url: `${window.location.origin}/donation/callback`,
        payment_type: 'banktransfer'
      };

      const response = await this.makeRequest('/charges?type=banktransfer', payload, 'POST');
      
      return {
        success: true,
        response: response as FlutterwaveResponse
      };
    } catch (error) {
      console.error('Flutterwave bank transfer payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bank transfer payment failed'
      };
    }
  }

  /**
   * Verify transaction status
   */
  async verifyTransaction(transactionId: string): Promise<{ 
    success: boolean; 
    status?: PaymentStatus; 
    data?: FlutterwaveVerificationResponse; 
    error?: string 
  }> {
    try {
      const response = await this.makeRequest(`/transactions/${transactionId}/verify`, {}, 'GET');
      const verificationData = response as FlutterwaveVerificationResponse;
      
      let paymentStatus: PaymentStatus = 'pending';
      
      switch (verificationData.data.status.toLowerCase()) {
        case 'successful':
          paymentStatus = 'completed';
          break;
        case 'failed':
          paymentStatus = 'failed';
          break;
        case 'pending':
          paymentStatus = 'processing';
          break;
        case 'cancelled':
          paymentStatus = 'cancelled';
          break;
        default:
          paymentStatus = 'pending';
      }

      return {
        success: true,
        status: paymentStatus,
        data: verificationData
      };
    } catch (error) {
      console.error('Flutterwave verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction verification failed'
      };
    }
  }

  /**
   * Make API request to Flutterwave
   */
  private async makeRequest(
    endpoint: string, 
    payload: any, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  ): Promise<any> {
    try {
      const url = `${this.config.baseUrl}${endpoint}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.config.secretKey}`
      };

      // Add timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const requestOptions: RequestInit = {
        method,
        headers,
        signal: controller.signal
      };

      if (method !== 'GET' && payload) {
        requestOptions.body = JSON.stringify(payload);
      }

      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP ${response.status}: ${response.statusText}`
        }));
        
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Check if Flutterwave returned an error
      if (data.status === 'error' || data.message) {
        throw new Error(data.message || 'Payment processing failed');
      }

      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw error;
    }
  }

  /**
   * Get supported mobile money networks for Rwanda
   */
  getSupportedMobileMoneyNetworks(): Array<{ code: string; name: string }> {
    return [
      { code: 'MTN', name: 'MTN Mobile Money' },
      { code: 'AIRTEL', name: 'Airtel Money' }
    ];
  }

  /**
   * Validate card number format (basic validation)
   */
  validateCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s+/g, '');
    return /^\d{13,19}$/.test(cleaned);
  }

  /**
   * Validate expiry date format
   */
  validateExpiryDate(expiryMonth: string, expiryYear: string): boolean {
    const month = parseInt(expiryMonth);
    const year = parseInt(expiryYear);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    if (month < 1 || month > 12) return false;
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;

    return true;
  }

  /**
   * Validate CVV format
   */
  validateCVV(cvv: string, cardNumber?: string): boolean {
    const cleaned = cvv.replace(/\s+/g, '');
    
    // American Express cards have 4-digit CVV, others have 3
    if (cardNumber) {
      const firstDigit = cardNumber.replace(/\s+/g, '')[0];
      if (firstDigit === '3') {
        return /^\d{4}$/.test(cleaned);
      }
    }
    
    return /^\d{3}$/.test(cleaned);
  }

  /**
   * Format card number for display
   */
  formatCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s+/g, '');
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }

  /**
   * Detect card type from card number
   */
  detectCardType(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s+/g, '');
    
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6/.test(cleaned)) return 'discover';
    
    return 'unknown';
  }

  /**
   * Simulate payment for testing (when in sandbox mode)
   */
  simulatePayment(
    amount: number,
    currency: string,
    paymentType: 'card' | 'mobilemoney' | 'banktransfer',
    txRef: string
  ): { success: boolean; response?: FlutterwaveResponse; error?: string } {
    const response: FlutterwaveResponse = {
      status: 'success',
      message: 'Simulation successful',
      data: {
        id: Math.floor(Math.random() * 1000000),
        tx_ref: txRef,
        flw_ref: `FLW-MOCK-${Date.now()}`,
        device_fingerprint: 'mock_fingerprint',
        amount: amount,
        currency: currency.toUpperCase(),
        charged_amount: amount,
        charge_type: paymentType,
        app_fee: 0,
        merchant_fee: 0,
        auth_model: paymentType === 'card' ? 'VBVSECURE' : 'USSD',
        ip: '127.0.0.1',
        narration: 'Test donation payment',
        status: 'successful',
        vbv_code: '00',
        vbv_message: 'Approved',
        redirect_url: `${window.location.origin}/donation/callback`,
        meta: { mock: true, simulated: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        plugin_version: '1.0.0',
        gateway_ref: `GW-${Date.now()}`,
        plan: null,
        order_id: `ORDER-${Date.now()}`,
        amount_settled: amount,
        neighborhood: null,
        street: null,
        billing_phone: null,
        billing_city: null,
        billing_address: null,
        billing_state: null,
        billing_country: null,
        account_id: 12345,
        customer: {
          id: 67890,
          name: 'Test User',
          phone_number: '+250788000000',
          email: 'test@example.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          full_data: {},
          custom_fields: []
        }
      }
    };

    return {
      success: true,
      response
    };
  }
}

export const flutterwavePaymentService = new FlutterwavePaymentService();
export default flutterwavePaymentService;