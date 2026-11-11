/**
 * Phone formatting and WhatsApp utilities for Brazilian Confectionery
 */

export function formatPhoneBR(value: string): string {
  if (!value) return '';
  // Remove all non-digits
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length === 0) return '';
  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    // Landline: (11) 4567-8901
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  // Mobile: (11) 98765-4321
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function cleanPhoneDigits(value: string): string {
  if (!value) return '';
  return value.replace(/\D/g, '');
}

export function getWhatsAppUrl(phone: string, message: string): string {
  let clean = cleanPhoneDigits(phone);
  if (!clean) return '';

  // If phone has 10 or 11 digits (DDD + number), prepend 55 (Brazil country code)
  if (clean.length === 10 || clean.length === 11) {
    clean = `55${clean}`;
  }

  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function isValidBRPhone(phone: string): boolean {
  const digits = cleanPhoneDigits(phone);
  return digits.length === 10 || digits.length === 11;
}
