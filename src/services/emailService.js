/**
 * Email Service Helper
 * Triggers the Vercel API endpoint /api/send-order-email
 * to dispatch order confirmation and admin alert emails.
 */
export async function triggerOrderConfirmationEmail(orderId, docId) {
  try {
    const response = await fetch('/api/send-order-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderId, docId })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.warn('[emailService] Email API response error:', response.status, errData);
      return {
        success: false,
        message: errData.error || `Server returned HTTP ${response.status}`
      };
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.warn('[emailService] Email API call failed (order remains valid):', err.message);
    return {
      success: false,
      message: err.message
    };
  }
}
