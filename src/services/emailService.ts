import emailjs from '@emailjs/browser';
import { Product } from '../types';

/**
 * EMAILJS CONFIGURATION
 * 
 * To activate real automated email sending via EmailJS:
 * 1. Sign up for free at https://www.emailjs.com (200 free emails/month)
 * 2. Create an Email Service (e.g. Gmail) -> get SERVICE_ID
 * 3. Create an Email Template -> get TEMPLATE_ID
 * 4. Get your Public Key from Account Settings -> get PUBLIC_KEY
 * 5. Replace the placeholder string values below.
 */
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_v_store',       // Replace with your EmailJS Service ID
  TEMPLATE_ID: 'template_prompt_order', // Replace with your EmailJS Template ID
  PUBLIC_KEY: 'user_public_key_here',   // Replace with your EmailJS Public Key
  SELLER_EMAIL: 'reviewshield.au@gmail.com',
};

export interface OrderRecord {
  id: string;
  userEmail: string;
  productTitle: string;
  price: number;
  wiseRefId: string;
  generatedPin: string;
  timestamp: string;
  isBundle: boolean;
  isAdminTest?: boolean;
  status: 'VERIFIED_AUTO' | 'CLAIMED_DOWNLOAD';
}

/**
 * Generates a unique 4-digit PIN for a transaction based on email and reference ID.
 */
export function generateUniqueOrderPin(userEmail: string, wiseRefId: string): string {
  let hash = 0;
  const str = `${userEmail.toLowerCase().trim()}_${wiseRefId.trim()}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const pin = Math.abs(hash % 9000) + 1000;
  return pin.toString();
}

/**
 * Saves order to browser localStorage for local order tracking.
 */
export function saveOrderToLocalStorage(order: OrderRecord): void {
  try {
    const existingStr = localStorage.getItem('v_store_orders');
    const orders: OrderRecord[] = existingStr ? JSON.parse(existingStr) : [];
    orders.unshift(order);
    localStorage.setItem('v_store_orders', JSON.stringify(orders));
  } catch (err) {
    console.error('Failed to save order to localStorage:', err);
  }
}

/**
 * Retrieves all stored orders for admin review.
 */
export function getStoredOrders(): OrderRecord[] {
  try {
    const existingStr = localStorage.getItem('v_store_orders');
    return existingStr ? JSON.parse(existingStr) : [];
  } catch {
    return [];
  }
}

/**
 * Clears all test orders from localStorage.
 */
export function clearStoredOrders(): void {
  try {
    localStorage.removeItem('v_store_orders');
  } catch (err) {
    console.error('Failed to clear orders from localStorage:', err);
  }
}

/**
 * Sends order notification & prompt receipt via EmailJS (or logs/fallbacks gracefully).
 */
export async function sendOrderEmails(
  userEmail: string,
  product: Product | null,
  isBundle: boolean,
  price: number,
  wiseRefId: string,
  generatedPin: string,
  isAdminTest: boolean = false
): Promise<{ success: boolean; message: string }> {
  const title = isBundle ? 'Complete AI Prompt Bundle' : product?.title || 'AI Prompt';
  const promptText = isBundle
    ? 'All 12+ AI Prompts included in your ZIP bundle.'
    : product?.promptPreview || '';

  const orderId = `V-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const timestamp = new Date().toLocaleString();

  // 1. Save order locally
  const newOrder: OrderRecord = {
    id: orderId,
    userEmail,
    productTitle: title,
    price,
    wiseRefId,
    generatedPin,
    timestamp,
    isBundle,
    isAdminTest,
    status: 'VERIFIED_AUTO',
  };
  saveOrderToLocalStorage(newOrder);

  // 2. Try EmailJS dispatch if configured
  try {
    if (
      EMAILJS_CONFIG.SERVICE_ID !== 'service_v_store' &&
      EMAILJS_CONFIG.PUBLIC_KEY !== 'user_public_key_here'
    ) {
      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        {
          order_id: orderId,
          to_email: userEmail,
          seller_email: EMAILJS_CONFIG.SELLER_EMAIL,
          product_title: title,
          price: `$${price} USD`,
          wise_ref_id: wiseRefId,
          verification_pin: generatedPin,
          prompt_text: promptText,
          order_time: timestamp,
        },
        EMAILJS_CONFIG.PUBLIC_KEY
      );
      return { success: true, message: 'Order confirmation and notification email sent successfully!' };
    }
  } catch (error) {
    console.warn('EmailJS delivery fallback (using direct download + local order log):', error);
  }

  return {
    success: true,
    message: 'Order recorded! Download initiated and local receipt generated.',
  };
}
