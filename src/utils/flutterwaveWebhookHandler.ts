import { supabase } from '../lib/supabase';

// Flutterwave webhook payload interface
interface FlutterwaveWebhookPayload {
  event: string;
  'event.type': string;
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
    payment_type: string;
    created_at: string;
    updated_at: string;
    customer: {
      id: number;
      name: string;
      phone_number: string | null;
      email: string;
    };
  };
}

class FlutterwaveWebhookHandler {
  private secretHash: string;

  constructor() {
    this.secretHash = import.meta.env.VITE_FLUTTERWAVE_SECRET_KEY || 'your_secret_hash';
  }

  /**
   * Verify webhook signature using HMAC-SHA256
   */
  private async verifySignature(payload: string, signature: string): Promise<boolean> {
    try {
      // For browser environments with Web Crypto API
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(this.secretHash);
        const payloadData = encoder.encode(payload);
        
        // Import the key for HMAC operation
        const key = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        
        const signatureBuffer = await crypto.subtle.sign('HMAC', key, payloadData);
        
        // Convert ArrayBuffer to hex string
        const hashArray = Array.from(new Uint8Array(signatureBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Compare with provided signature (case-insensitive)
        return hashHex.toLowerCase() === signature.toLowerCase();
      }
      
      // For Node.js environments - check if Node.js crypto is available
      if (typeof global !== 'undefined' && (global as any).crypto && (global as any).crypto.createHmac) {
        const crypto = (global as any).crypto;
        const hmac = crypto.createHmac('sha256', this.secretHash);
        hmac.update(payload, 'utf8');
        const expectedSignature = hmac.digest('hex');
        
        return expectedSignature.toLowerCase() === signature.toLowerCase();
      }
      
      // If no crypto implementation is available, log warning and return false for security
      console.warn('No crypto implementation available for signature verification - rejecting webhook for security');
      return false;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Process successful payment
   */
  private async processSuccessfulPayment(data: any): Promise<void> {
    try {
      console.log('Processing successful Flutterwave payment:', data);

      // Extract transaction details
      const { tx_ref, amount, currency, customer } = data;
      const transactionId = data.id.toString();
      const donorEmail = customer.email;
      const donorName = customer.name;
      const paymentMethod = data.payment_type || 'flutterwave';

      // Store payment record in database (if using Supabase)
      if (supabase) {
        const { error } = await supabase
          .from('donations')
          .insert({
            donation_id: tx_ref,
            donor_email: donorEmail,
            donor_name: donorName,
            amount: amount,
            currency: currency,
            payment_method: paymentMethod,
            payment_provider: 'flutterwave',
            transaction_id: transactionId,
            provider_transaction_id: data.flw_ref,
            status: 'completed',
            payment_type: 'donation',
            created_at: new Date().toISOString(),
            metadata: {
              event: 'charge.completed',
              webhook_data: data
            }
          });

        if (error) {
          console.error('Error storing donation record:', error);
        } else {
          console.log('Donation record stored successfully');
        }
      }

      // Send confirmation email (if email service is configured)
      // Email sending functionality to be implemented when email service is set up

      // Update any related records (to be implemented when needed)
      // await this.updateRelatedRecords(tx_ref, 'completed', data);

      console.log(`Payment completed for donation ${tx_ref}: ${amount} ${currency}`);
    } catch (error) {
      console.error('Error processing successful payment:', error);
      throw error;
    }
  }

  /**
   * Process failed payment
   */
  private async processFailedPayment(data: any): Promise<void> {
    try {
      console.log('Processing failed Flutterwave payment:', data);

      const { tx_ref, amount, currency, customer } = data;

      // Update donation record in database
      if (supabase) {
        const { error } = await supabase
          .from('donations')
          .upsert({
            donation_id: tx_ref,
            donor_email: customer.email,
            donor_name: customer.name,
            amount: amount,
            currency: currency,
            payment_method: data.payment_type || 'flutterwave',
            payment_provider: 'flutterwave',
            status: 'failed',
            payment_type: 'donation',
            updated_at: new Date().toISOString(),
            metadata: {
              event: 'charge.failed',
              webhook_data: data
            }
          }, {
            onConflict: 'donation_id'
          });

        if (error) {
          console.error('Error updating failed donation record:', error);
        }
      }

      console.log(`Payment failed for donation ${tx_ref}`);
    } catch (error) {
      console.error('Error processing failed payment:', error);
      throw error;
    }
  }

  /**
   * Process cancelled payment
   */
  private async processCancelledPayment(data: any): Promise<void> {
    try {
      console.log('Processing cancelled Flutterwave payment:', data);

      const { tx_ref } = data;

      // Update donation record in database
      if (supabase) {
        const { error } = await supabase
          .from('donations')
          .upsert({
            donation_id: tx_ref,
            status: 'cancelled',
            updated_at: new Date().toISOString(),
            metadata: {
              event: 'charge.cancelled',
              webhook_data: data
            }
          }, {
            onConflict: 'donation_id'
          });

        if (error) {
          console.error('Error updating cancelled donation record:', error);
        }
      }

      console.log(`Payment cancelled for donation ${tx_ref}`);
    } catch (error) {
      console.error('Error processing cancelled payment:', error);
      throw error;
    }
  }

  /**
   * Process refunded payment
   */
  private async processRefundedPayment(data: any): Promise<void> {
    try {
      console.log('Processing refunded Flutterwave payment:', data);

      const { tx_ref } = data;

      // Update donation record in database
      if (supabase) {
        const { error } = await supabase
          .from('donations')
          .upsert({
            donation_id: tx_ref,
            status: 'refunded',
            updated_at: new Date().toISOString(),
            metadata: {
              event: 'charge.refunded',
              webhook_data: data
            }
          }, {
            onConflict: 'donation_id'
          });

        if (error) {
          console.error('Error updating refunded donation record:', error);
        }
      }

      console.log(`Payment refunded for donation ${tx_ref}`);
    } catch (error) {
      console.error('Error processing refunded payment:', error);
      throw error;
    }
  }

  /**
   * Main webhook handler
   */
  async handleWebhook(
    payload: FlutterwaveWebhookPayload,
    signature: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Verify webhook signature
      const isValidSignature = await this.verifySignature(JSON.stringify(payload), signature);
      if (!isValidSignature) {
        console.error('Invalid webhook signature');
        return { success: false, message: 'Invalid signature' };
      }

      console.log('Processing Flutterwave webhook:', payload.event);

      // Process different event types
      switch (payload.event) {
        case 'charge.completed':
          if (payload.data.status === 'successful') {
            await this.processSuccessfulPayment(payload.data);
          }
          break;

        case 'charge.failed':
          await this.processFailedPayment(payload.data);
          break;

        case 'charge.cancelled':
          await this.processCancelledPayment(payload.data);
          break;

        case 'charge.refunded':
          await this.processRefundedPayment(payload.data);
          break;

        default:
          console.log(`Unhandled webhook event: ${payload.event}`);
          return { success: true, message: `Event ${payload.event} acknowledged but not processed` };
      }

      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      console.error('Error processing Flutterwave webhook:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }




}

export const flutterwaveWebhookHandler = new FlutterwaveWebhookHandler();
export default flutterwaveWebhookHandler;