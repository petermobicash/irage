# Flutterwave Payment Integration for Donations

This document provides a comprehensive guide for implementing and using the Flutterwave payment integration for donation processing in the Benirage platform.

## 🚀 Overview

The Flutterwave integration enables secure donation processing with support for:
- **Mobile Money** (MTN, Airtel) for Rwanda
- **Credit/Debit Cards** (Visa, Mastercard, etc.)
- **Bank Transfers** for multiple currencies

## 🔧 Configuration

### Environment Variables

Add the following to your `.env` file:

```bash
# Flutterwave Payment Configuration (Sandbox)
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-e7b862d8ff9c4b889410f6e179914598-X
VITE_FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-HfoDt2LuKjp1LrUitEN4kqIRW2G71q6i
VITE_FLUTTERWAVE_ENCRYPTION_KEY=njuGc1NVPaKPFE9iW/c/Bx52Ya96HeXkk8Gm9kRzH70=
VITE_FLUTTERWAVE_SANDBOX=true
VITE_FLUTTERWAVE_CURRENCY=RWF
VITE_FLUTTERWAVE_CALLBACK_URL=http://localhost:3000/donation/callback
VITE_FLUTTERWAVE_WEBHOOK_URL=http://localhost:3000/api/payments/flutterwave/webhook
```

### Production Setup

For production, update the credentials and URLs:

```bash
# Use production keys from your Flutterwave dashboard
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-your-production-public-key
VITE_FLUTTERWAVE_SECRET_KEY=FLWSECK-your-production-secret-key
VITE_FLUTTERWAVE_ENCRYPTION_KEY=your-production-encryption-key
VITE_FLUTTERWAVE_SANDBOX=false
VITE_FLUTTERWAVE_CALLBACK_URL=https://yourdomain.com/donation/callback
VITE_FLUTTERWAVE_WEBHOOK_URL=https://yourdomain.com/api/payments/flutterwave/webhook
```

## 💳 Payment Methods

### 1. Mobile Money (MTN, Airtel)
- **Currency**: RWF
- **Networks**: MTN Mobile Money, Airtel Money
- **Phone Format**: Support for both local and international formats
  - Local: `0788123456`
  - International: `+250788123456`
  - With country code: `250788123456`

### 2. Credit/Debit Cards
- **Currencies**: USD, EUR, RWF, KES, UGX, TZS
- **Card Types**: Visa, Mastercard, American Express
- **Security**: 3D Secure (VBV) support

### 3. Bank Transfers
- **Currencies**: USD, EUR, RWF, KES, UGX, TZS
- **Type**: Direct bank transfers

## 🛠️ Usage

### Basic Integration

```typescript
import { flutterwavePaymentService } from '../utils/flutterwavePaymentService';
import { paymentService } from '../utils/paymentService';

// Using the main payment service (recommended)
const processDonation = async (donationData: DonationFormData) => {
  const paymentResponse = await paymentService.processPayment({
    donationId: `donation_${Date.now()}`,
    donorEmail: donationData.donorEmail,
    paymentData: {
      amount: donationData.amount,
      currency: donationData.currency,
      method: donationData.paymentMethod,
      mobileMoneyData: donationData.paymentMethod === 'mobile-money' ? {
        phoneNumber: donationData.donorPhone,
        provider: 'mtn'
      } : undefined
    }
  });

  return paymentResponse;
};
```

### Direct Flutterwave Service Usage

```typescript
// Mobile Money Payment
const processMobileMoney = async (amount: number, currency: string, phoneNumber: string) => {
  const result = await flutterwavePaymentService.processMobileMoneyPayment(
    amount,
    currency,
    phoneNumber,
    'MTN', // Network provider
    {
      email: 'donor@example.com',
      fullname: 'Donor Name'
    },
    'unique_tx_ref_' + Date.now()
  );

  if (result.success) {
    console.log('Payment initiated:', result.response);
    return result.response;
  } else {
    console.error('Payment failed:', result.error);
    throw new Error(result.error);
  }
};

// Card Payment
const processCardPayment = async (cardData: any, amount: number, currency: string) => {
  const result = await flutterwavePaymentService.processCardPayment(
    amount,
    currency,
    cardData,
    {
      email: 'donor@example.com',
      fullname: 'Donor Name'
    }
  );

  return result;
};

// Bank Transfer
const processBankTransfer = async (amount: number, currency: string) => {
  const result = await flutterwavePaymentService.processBankTransferPayment(
    amount,
    currency,
    {
      email: 'donor@example.com',
      fullname: 'Donor Name'
    }
  );

  return result;
};
```

## 🔍 Transaction Verification

```typescript
const verifyTransaction = async (transactionId: string) => {
  const result = await flutterwavePaymentService.verifyTransaction(transactionId);
  
  if (result.success) {
    console.log('Transaction status:', result.status);
    return result;
  } else {
    console.error('Verification failed:', result.error);
    return result;
  }
};
```

## 🌐 Webhooks

The webhook handler processes payment notifications from Flutterwave:

```typescript
import { flutterwaveWebhookHandler } from '../utils/flutterwaveWebhookHandler';

// Handle webhook
const handleWebhook = async (payload: any, signature: string) => {
  const result = await flutterwaveWebhookHandler.handleWebhook(payload, signature);
  
  if (result.success) {
    console.log('Webhook processed:', result.message);
  } else {
    console.error('Webhook failed:', result.message);
  }
  
  return result;
};
```

### Supported Webhook Events

- `charge.completed` - Payment successful
- `charge.failed` - Payment failed
- `charge.cancelled` - Payment cancelled
- `charge.refunded` - Payment refunded

## 🧪 Testing

### Test Phone Numbers

For mobile money testing in sandbox:
- `+250788000000` - Standard test number
- `+2507889999` - Timeout simulation
- `+2507880001` - Insufficient funds simulation

### Test Card Numbers

For card testing:
- `4242424242424242` - Visa test card
- `5555555555554444` - Mastercard test card
- `4000000000000002` - Declined card simulation

### Run Integration Tests

```bash
# Import and run the test suite
import { FlutterwavePaymentTest } from '../test/flutterwaveIntegrationTest';

const test = new FlutterwavePaymentTest();
await test.runAllTests();
```

## 📋 Database Integration

The webhook handler automatically stores payment records in the Supabase database:

```sql
-- Donation records are stored in the 'donations' table
-- Webhook logs are stored in the 'webhook_logs' table

-- Sample donation record structure:
{
  donation_id: "benirage_donation_1640995200000_abc123",
  donor_email: "donor@example.com",
  donor_name: "Donor Name",
  amount: 5000,
  currency: "RWF",
  payment_method: "mobilemoney",
  payment_provider: "flutterwave",
  transaction_id: "123456",
  status: "completed",
  payment_type: "donation"
}
```

## 🔒 Security Features

1. **Signature Verification**: Webhook signatures are verified
2. **Input Validation**: All payment inputs are validated
3. **Error Handling**: Comprehensive error handling and logging
4. **Sandbox Mode**: Safe testing with simulated payments

## 📊 Monitoring and Logging

### Transaction Monitoring
- All transactions are logged with detailed metadata
- Failed payments include error details
- Webhook processing is tracked

### Error Handling
```typescript
try {
  const result = await flutterwavePaymentService.processMobileMoneyPayment(/*...*/);
  
  if (!result.success) {
    // Handle specific error cases
    if (result.error?.includes('insufficient funds')) {
      // Handle insufficient funds
    } else if (result.error?.includes('network')) {
      // Handle network errors
    }
  }
} catch (error) {
  // Handle unexpected errors
  console.error('Payment processing error:', error);
}
```

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Update environment variables with production credentials
- [ ] Set `VITE_FLUTTERWAVE_SANDBOX=false`
- [ ] Update callback and webhook URLs to production domain
- [ ] Test with live transactions (small amounts)
- [ ] Configure webhook endpoint in Flutterwave dashboard

### Production URLs
```
Callback URL: https://yourdomain.com/donation/callback
Webhook URL: https://yourdomain.com/api/payments/flutterwave/webhook
```

### Flutterwave Dashboard Configuration
1. Log into your Flutterwave dashboard
2. Go to Settings → API & Webhooks
3. Add your production webhook URL
4. Enable the events you want to receive

## 📞 Support

### Flutterwave Resources
- [Documentation](https://developer.flutterwave.com/docs/)
- [Dashboard](https://dashboard.flutterwave.com/)
- [Support](https://support.flutterwave.com/)

### Integration Support
- Check the browser console for detailed error messages
- Verify environment variables are correctly set
- Ensure webhook URLs are accessible from the internet
- Test with sandbox credentials before going live

## 🔄 Migration from Other Payment Methods

The existing donation system has been enhanced to support Flutterwave alongside existing methods (Stripe, MTN, PayPal). The `paymentService` automatically routes payments to the appropriate provider based on the selected method and currency.

To migrate users to Flutterwave:
1. Update your donation forms to highlight Flutterwave as the preferred method
2. Configure Flutterwave as the default for RWF transactions
3. Gradually phase out other providers if needed

---

**Note**: Always test thoroughly in sandbox mode before deploying to production. The provided sandbox credentials are for testing only and should not be used in production.