import { APP_CONFIG } from '../config/appConfig';

/**
 * Generates a WhatsApp URL with an optional pre-filled message.
 * @param {string} message - The pre-filled message (optional).
 * @returns {string} The formatted WhatsApp URL.
 */
export const getWhatsAppUrl = (message = '') => {
    const baseUrl = `https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}`;
    if (message) {
        return `${baseUrl}?text=${encodeURIComponent(message)}`;
    }
    return baseUrl;
};

/**
 * Opens WhatsApp in a new tab with an optional pre-filled message.
 * @param {string} message - The pre-filled message (optional).
 */
export const openWhatsApp = (message = '') => {
    window.open(getWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
};
