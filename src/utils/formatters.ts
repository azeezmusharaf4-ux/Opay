export function formatNgn(amount: number, includeSymbol: boolean = true): string {
  const formatted = new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return includeSymbol ? `₦${formatted}` : formatted;
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  
  const isToday = date.toDateString() === now.toDateString();
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  
  if (isToday) {
    return `Today, ${timeStr}`;
  }
  
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${dateStr} ${timeStr}`;
}

export function formatFullOpayDate(timestamp: number): string {
  const d = new Date(timestamp);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  
  // ordinal suffix
  let ordinal = 'th';
  if (day === 1 || day === 21 || day === 31) ordinal = 'st';
  else if (day === 2 || day === 22) ordinal = 'nd';
  else if (day === 3 || day === 23) ordinal = 'rd';
  
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return `${month} ${day}${ordinal}, ${year} ${hours}:${minutes}:${seconds}`;
}

export function formatHistoryRowDate(timestamp: number): string {
  const d = new Date(timestamp);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = d.getDate();
  
  let ordinal = 'th';
  if (day === 1 || day === 21 || day === 31) ordinal = 'st';
  else if (day === 2 || day === 22) ordinal = 'nd';
  else if (day === 3 || day === 23) ordinal = 'rd';
  
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return `${month} ${day}${ordinal}, ${hours}:${minutes}:${seconds}`;
}

export function formatPhoneWithSpaces(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    // 0912 585 6006 or 912 585 6006
    const withoutZero = cleaned.substring(1);
    return `${withoutZero.slice(0, 3)} ${withoutZero.slice(3, 6)} ${withoutZero.slice(6)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

export function maskAccountNumber(acc: string): string {
  if (!acc || acc.length < 6) return acc;
  return `${acc.substring(0, 3)}****${acc.substring(acc.length - 3)}`;
}

export function formatMaskedOpayPhone(phone: string): string {
  if (!phone) return '704****742';
  const digits = phone.replace(/\D/g, '');
  const normalized = digits.length === 11 && digits.startsWith('0') ? digits.slice(1) : digits;
  if (normalized.length >= 6) {
    return `${normalized.slice(0, 3)}****${normalized.slice(-3)}`;
  }
  return phone;
}

export function formatOpayTransactionNumber(reference?: string, timestamp?: number): string {
  const d = timestamp ? new Date(timestamp) : new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const prefix = `${yy}${mm}${dd}010100`;

  if (reference) {
    const digits = reference.replace(/\D/g, '');
    if (digits.length === 24) return digits;
    if (digits.length >= 12) {
      return `${prefix}${digits.slice(-12)}`;
    }
  }

  let seed = 0;
  const refStr = reference || `${timestamp || Date.now()}`;
  for (let i = 0; i < refStr.length; i++) {
    seed = (seed * 31 + refStr.charCodeAt(i)) % 1000000000000;
  }
  const suffix = String(seed).padStart(12, '577848148717').slice(-12);
  return `${prefix}${suffix}`;
}

export function generateReference(): string {
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `OPAY${datePart}${randomStr}`;
}

export function generateSessionId(): string {
  // 30 digit NIBSS format session id
  let res = '100004' + Date.now().toString();
  while (res.length < 30) {
    res += Math.floor(Math.random() * 10).toString();
  }
  return res.slice(0, 30);
}
