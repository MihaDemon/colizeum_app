import { API_BASE_URL } from '../constants/api';
import { getAuthToken, getInitData } from '../utils/helpers';

export const fetchProfileApi = async (token) => {
  const res = await fetch(`${API_BASE_URL}/api/users/me/`, {
    headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
};

export const fetchUserPositionApi = async (token) => {
  const res = await fetch(`${API_BASE_URL}/api/leaderboard/position`, {
    headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch position');
  return res.json();
};

export const fetchGlobalLeaderboardApi = async (token) => {
  const res = await fetch(`${API_BASE_URL}/api/leaderboard/`, {
    headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
};

export const fetchPromocodesApi = async (token) => {
  const res = await fetch(`${API_BASE_URL}/api/spins/`, {
    headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch promocodes');
  return res.json();
};

export const fetchDailyBonusesApi = async (token) => {
  const res = await fetch(`${API_BASE_URL}/api/daily-bonuses/last/`, {
    headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch last daily bonus');
  return res.json();
};

export const fetchWheelPrizesApi = async (token) => {
  const res = await fetch(`${API_BASE_URL}/api/wheel-prizes/`, {
    headers: { 'Authorization': `Token ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch wheel prizes');
  return res.json();
};

export const claimDailyBonusApi = async (token) => {
  const res = await fetch(`${API_BASE_URL}/api/daily-bonuses/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.detail || 'Не удалось получить бонус.');
  return data;
};

export const authenticateUserApi = async (payloadData = {}) => {
  const initData = getInitData();
  if (!initData) {
    throw new Error('NO_INIT_DATA');
  }

  const res = await fetch(`${API_BASE_URL}/api/auth/telegram/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initData, ...payloadData })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.detail || 'Ошибка авторизации.');
  return data;
};

export const spinWheelApi = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/spins/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`
    }
  });
  const spinData = await response.json();
  if (!response.ok) throw new Error(spinData.error || spinData.detail || 'Не удалось совершить спин.');
  return spinData;
};

export const adminTransactionApi = async (cleanPhone, transAmount, transCheckNumber) => {
  const res = await fetch(`${API_BASE_URL}/api/transactions/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${getAuthToken()}`
    },
    body: JSON.stringify({
      user_phone: cleanPhone,
      amount_rub: parseInt(transAmount, 10),
      check_number: transCheckNumber.trim()
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.detail || 'Ошибка проведения транзакции.');
  return data;
};

export const adminRedeemApi = async (cleanedCode, endpoint) => {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${getAuthToken()}`
    },
    body: JSON.stringify({ promo_code: cleanedCode })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.detail || 'Не удалось погасить промокод.');
  return data;
};
