import axios from 'axios';

const CLUB_API_BASE_URL = 'https://api.clubapi.in/transaction.php';
const CLUB_API_TOKEN = 'YMCRVLYNFR0FVLJTAKG3MNKU0W1KID';

const apiClient = axios.create({
  baseURL: CLUB_API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Generate unique URID for transactions
function generateURID() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 5);
}

// Mobile Recharge
export async function mobileRecharge({ mobile, operatorId, amount, customerMobile }) {
  try {
    const urid = generateURID();
    const response = await apiClient.post('', {
      token: CLUB_API_TOKEN,
      urid,
      operatorId,
      mobile,
      amount: amount.toString(),
      customerMobile
    });
    return {
      ...response.data.data,
      urid
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Mobile recharge failed');
  }
}

// DTH Recharge
export async function dthRecharge({ subscriberId, operatorId, amount, customerMobile }) {
  try {
    const urid = generateURID();
    const response = await apiClient.post('', {
      token: CLUB_API_TOKEN,
      urid,
      operatorId,
      mobile: subscriberId,
      amount: amount.toString(),
      customerMobile
    });
    return {
      ...response.data.data,
      urid
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'DTH recharge failed');
  }
}

// Fetch Mobile Operators - This needs to be implemented based on available operators
export async function fetchMobileOperators() {
  // Since the API doesn't provide a direct endpoint for operators,
  // we'll return a static list or implement based on documentation
  // This should be updated with actual operator list from ClubAPI
  return [
    { id: '1', name: 'Airtel', category: 'mobile' },
    { id: '2', name: 'Vodafone', category: 'mobile' },
    { id: '3', name: 'Jio', category: 'mobile' },
    { id: '4', name: 'BSNL', category: 'mobile' }
  ];
}

// Fetch DTH Providers
export async function fetchDthProviders() {
  // Static list - should be updated with actual API
  return [
    { id: '5', name: 'Airtel DTH', category: 'dth' },
    { id: '6', name: 'Dish TV', category: 'dth' },
    { id: '7', name: 'Tata Sky', category: 'dth' },
    { id: '8', name: 'Sun Direct', category: 'dth' }
  ];
}

// BBPS Bill Fetch
export async function bbpsFetchBill({ provider, accountRef, billType, bbpsId }) {
  try {
    const urid = generateURID();
    const response = await apiClient.post('', {
      token: CLUB_API_TOKEN,
      urid,
      operatorId: provider,
      mobile: accountRef,
      amount: '0', // For bill fetch, amount might not be required
      bbpsId,
      opvalue1: billType // Using opvalue1 for bill type
    });
    return {
      ...response.data.data,
      urid
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'BBPS bill fetch failed');
  }
}

// BBPS Bill Payment
export async function bbpsPay({ provider, accountRef, billType, amount, billNumber, bbpsId }) {
  try {
    const urid = generateURID();
    const response = await apiClient.post('', {
      token: CLUB_API_TOKEN,
      urid,
      operatorId: provider,
      mobile: accountRef,
      amount: amount.toString(),
      bbpsId,
      opvalue1: billType,
      opvalue2: billNumber // Using opvalue2 for bill number
    });
    return {
      ...response.data.data,
      urid
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'BBPS payment failed');
  }
}

// Check Recharge Status
export async function checkRechargeStatus({ urid }) {
  try {
    // Status check might need a different endpoint or parameters
    // This is a placeholder - needs to be updated based on actual API
    const response = await apiClient.post('', {
      token: CLUB_API_TOKEN,
      urid,
      operatorId: 'STATUS_CHECK' // Placeholder
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Status check failed');
  }
}
