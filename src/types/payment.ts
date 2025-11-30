// Payment method types
export type PaymentMethod = 'card' | 'bank-transfer' | 'mobile-money' | 'paypal' | 'check' | 'cash' | 'other';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';

export type Currency = 'USD' | 'EUR' | 'RWF' | 'KES' | 'UGX' | 'TZS';

export type PaymentFrequency = 'one-time' | 'monthly' | 'quarterly' | 'annually';

// Payment provider types
export interface PaymentProvider {
  name: string;
  sandbox: boolean;
  supportedMethods: PaymentMethod[];
  supportedCurrencies: Currency[];
}

// Card payment details
export interface CardPaymentData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  holderName: string;
}

// Mobile money details
export interface MobileMoneyData {
  phoneNumber: string;
  provider: 'mtn' | 'airtel';
}

// MTN-specific payment data
export interface MtnPaymentData {
  phoneNumber: string;
  amount: number;
  currency: string;
  externalId: string;
  payerMessage?: string;
  payeeNote?: string;
}

// MTN payment response
export interface MtnPaymentResponse {
  success: boolean;
  paymentId?: string;
  status: PaymentStatus;
  financialTransactionId?: string;
  externalId?: string;
  amount?: number;
  currency?: string;
  payerMessage?: string;
  payeeNote?: string;
  error?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

// MTN payment status
export type MtnPaymentStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'CANCELLED' | 'TIMEOUT';

// MTN webhook payload
export interface MtnWebhookPayload {
  financialTransactionId: string;
  externalId: string;
  amount: number;
  currency: string;
  status: MtnPaymentStatus;
  reason?: string;
  payer: {
    partyIdType: string;
    partyId: string;
  };
  payeeNote?: string;
  payerMessage?: string;
  timestamp: string;
}

// Bank transfer details
export interface BankTransferData {
  accountNumber: string;
  bankName: string;
  accountHolder: string;
}

// PayPal details
export interface PayPalData {
  email: string;
}

// Generic payment data
export interface PaymentData {
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  cardData?: CardPaymentData;
  mobileMoneyData?: MobileMoneyData;
  bankTransferData?: BankTransferData;
  paypalData?: PayPalData;
}

// Payment response
export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  status: PaymentStatus;
  redirectUrl?: string;
  error?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

// Payment verification
export interface PaymentVerification {
  paymentId: string;
  expectedAmount: number;
  currency: Currency;
}

// Donation payment integration
export interface DonationPaymentData {
  donationId: string;
  donorEmail: string;
  paymentData: PaymentData;
  callbackUrl?: string;
  webhookUrl?: string;
}

// Flutterwave-specific types
export interface FlutterwavePaymentData {
  amount: number;
  currency: string;
  email: string;
  phoneNumber?: string;
  fullName?: string;
  txRef: string;
  paymentType: 'card' | 'mobilemoney' | 'banktransfer';
  redirectUrl?: string;
  currencyCode?: string;
}

export interface FlutterwaveChargeRequest {
  card_number?: string;
  cvv?: string;
  expiry_month?: string;
  expiry_year?: string;
  currency: string;
  amount: number;
  email: string;
  phone_number?: string;
  fullname?: string;
  tx_ref: string;
  redirect_url?: string;
  payment_type: 'card' | 'mobilemoney' | 'banktransfer';
  enctype?: string;
  order_id?: string;
  billing_name?: string;
  billing_address?: string;
  billing_city?: string;
  billing_state?: string;
  billing_country?: string;
  billing_zip?: string;
  device_fingerprint?: string;
  network?: string; // Mobile money network (MTN, AIRTEL, VODAFONE, etc.)
  meta?: Record<string, any>;
}

export interface FlutterwaveResponse {
  status: string;
  message: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    charge_type: string;
    app_fee: number;
    merchant_fee: number;
    auth_model: string;
    ip: string;
    narration: string;
    status: string;
    vbv_code: string;
    vbv_message: string;
    redirect_url: string;
    meta: Record<string, any>;
    created_at: string;
    updated_at: string;
    plugin_version: string;
    gateway_ref: string;
    plan: string | null;
    order_id: string;
    amount_settled: number;
    neighborhood: string | null;
    street: string | null;
    billing_phone: string | null;
    billing_city: string | null;
    billing_address: string | null;
    billing_state: string | null;
    billing_country: string | null;
    customer: {
      id: number;
      name: string;
      phone_number: string | null;
      email: string;
      created_at: string;
      updated_at: string;
      full_data: Record<string, any>;
      custom_fields: Array<{
        display_name: string;
        variable_name: string;
        value: string;
      }>;
    };
    account_id: number;
  };
}

export interface FlutterwaveVerificationResponse {
  status: string;
  message: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    charge_type: string;
    app_fee: number;
    merchant_fee: number;
    auth_model: string;
    ip: string;
    narration: string;
    status: string;
    vbv_code: string;
    vbv_message: string;
    redirect_url: string;
    meta: Record<string, any>;
    created_at: string;
    updated_at: string;
    amount_settled: number;
    settlement_date: string;
    neighbourhood: string | null;
    billing_phone: string | null;
    billing_city: string | null;
    billing_address: string | null;
    billing_state: string | null;
    billing_country: string | null;
    customer: {
      id: number;
      name: string;
      phone_number: string | null;
      email: string;
    };
  };
}