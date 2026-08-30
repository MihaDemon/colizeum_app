export const API_BASE_URL = 'https://colizeum-perovo.com';

export const getAuthToken = () => localStorage.getItem('auth_token') || '';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Token ${getAuthToken()}`
});

export const apiFetchProfile = () => fetch(`${API_BASE_URL}/api/users/me/`, { headers: getHeaders() }).then(res => res.json());
export const apiFetchPosition = () => fetch(`${API_BASE_URL}/api/leaderboard/position`, { headers: getHeaders() }).then(res => res.json());
export const apiFetchLeaderboard = () => fetch(`${API_BASE_URL}/api/leaderboard/`, { headers: getHeaders() }).then(res => res.json());
export const apiFetchPromocodes = () => fetch(`${API_BASE_URL}/api/spins/`, { headers: getHeaders() }).then(res => res.json());
export const apiFetchDailyBonus = () => fetch(`${API_BASE_URL}/api/daily-bonuses/last/`, { headers: getHeaders() }).then(res => res.json());
export const apiFetchWheelPrizes = () => fetch(`${API_BASE_URL}/api/wheel-prizes/`, { headers: getHeaders() }).then(res => res.json());

export const apiClaimDailyBonus = () => fetch(`${API_BASE_URL}/api/daily-bonuses/`, { method: 'POST', headers: getHeaders() });
export const apiSpinWheel = () => fetch(`${API_BASE_URL}/api/spins/`, { method: 'POST', headers: getHeaders() });

export const apiAdminTransaction = (data) => fetch(`${API_BASE_URL}/api/transactions/`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
export const apiAdminRedeem = (endpoint, code) => fetch(endpoint, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ promo_code: code }) });

export const apiAuthenticate = (initData, payloadData = {}) => fetch(`${API_BASE_URL}/api/auth/telegram/`, { 
  method: 'POST', 
  headers: { 'Content-Type': 'application/json' }, 
  body: JSON.stringify({ initData, ...payloadData }) 
});