// Netlify Serverless Function: List Nigerian Banks via Paystack or Standard Directory

const NIGERIAN_BANKS = [
  { name: 'OPay (Paycom)', code: '999992', slug: 'opay', isOpay: true },
  { name: 'Momo Payment Service Bank', code: '120003', slug: 'momo-psb' },
  { name: 'Guaranty Trust Bank (GTBank)', code: '058', slug: 'guaranty-trust-bank' },
  { name: 'Access Bank Plc', code: '044', slug: 'access-bank' },
  { name: 'Zenith Bank Plc', code: '057', slug: 'zenith-bank' },
  { name: 'United Bank for Africa (UBA)', code: '033', slug: 'united-bank-for-africa' },
  { name: 'First Bank of Nigeria', code: '011', slug: 'first-bank-of-nigeria' },
  { name: 'Kuda Microfinance Bank', code: '50211', slug: 'kuda-bank' },
  { name: 'Moniepoint Microfinance Bank', code: '50515', slug: 'moniepoint-mfb' },
  { name: 'PalmPay Limited', code: '999991', slug: 'palmpay' },
  { name: 'Stanbic IBTC Bank', code: '221', slug: 'stanbic-ibtc-bank' },
  { name: 'Fidelity Bank', code: '070', slug: 'fidelity-bank' },
  { name: 'Sterling Bank', code: '232', slug: 'sterling-bank' },
  { name: 'Union Bank of Nigeria', code: '032', slug: 'union-bank-of-nigeria' },
  { name: 'Wema Bank / ALAT', code: '035', slug: 'wema-bank' },
  { name: 'Ecobank Nigeria', code: '050', slug: 'ecobank-nigeria' },
  { name: 'Polaris Bank', code: '076', slug: 'polaris-bank' },
  { name: 'First City Monument Bank (FCMB)', code: '214', slug: 'first-city-monument-bank' },
  { name: 'Taj Bank', code: '302', slug: 'taj-bank' },
  { name: 'Jaiz Bank', code: '301', slug: 'jaiz-bank' },
];

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export const handler = async (event: any) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  const secretKey = (
    process.env.PAYSTACK_SECRET_KEY ||
    process.env.VITE_PAYSTACK_SECRET_KEY ||
    ''
  ).trim().replace(/^['"]|['"]$/g, '');

  if (secretKey && secretKey.length > 5) {
    try {
      const response = await fetch('https://api.paystack.co/bank?country=nigeria&perPage=100', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok && data.status && Array.isArray(data.data)) {
        const banks = data.data.map((b: any) => ({
          name: b.name,
          code: b.code,
          slug: b.slug,
          isOpay: b.name.toLowerCase().includes('opay') || b.code === '999992',
        }));
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({ success: true, banks }),
        };
      }
    } catch {
      // fallback to cached list
    }
  }

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ success: true, banks: NIGERIAN_BANKS }),
  };
};
