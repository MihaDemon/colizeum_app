import React, { useState } from 'react';
import { apiAdminTransaction, apiAdminRedeem, API_BASE_URL } from '../api/client';
import { WinnerModal } from '../components/Modals';
import { styles } from '../utils/styles';

export default function AdminPanel({ profile }) {
  const [transPhone, setTransPhone] = useState('');
  const [transAmount, setTransAmount] = useState('');
  const [transCheckNumber, setTransCheckNumber] = useState('');
  const [transLoading, setTransLoading] = useState(false);
  const [transFeedback, setTransFeedback] = useState(null);

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoType, setPromoType] = useState('auto');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoFeedback, setPromoFeedback] = useState(null);
  const [wonPrize, setWonPrize] = useState(null);

  const handleTransaction = async (e) => {
    e.preventDefault();
    const cleanPhone = transPhone.trim();
    if (!/^\d{10}$/.test(cleanPhone) || !transAmount || !transCheckNumber.trim()) {
      return setTransFeedback({ type: 'error', message: 'Проверьте правильность заполнения полей.' });
    }
    
    setTransLoading(true);
    try {
      const res = await apiAdminTransaction({ user_phone: cleanPhone, amount_rub: parseInt(transAmount, 10), check_number: transCheckNumber.trim() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail);
      setTransFeedback({ type: 'success', message: `Чек на ${transAmount} RUB успешно проведен для +7${cleanPhone}!` });
      setTransPhone(''); setTransAmount(''); setTransCheckNumber('');
    } catch (err) {
      setTransFeedback({ type: 'error', message: err.message });
    } finally {
      setTransLoading(false);
    }
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);

    let endpoint = `${API_BASE_URL}/api/spins/redeem/`;
    if (promoType === 'daily' || (promoType === 'auto' && code.startsWith('DAILY'))) {
      endpoint = `${API_BASE_URL}/api/daily-bonuses/redeem/`;
    }

    try {
      const res = await apiAdminRedeem(endpoint, code);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail);
      
      const prizeInfo = data.spin?.prize || data.spin?.prize_name || data.bonus?.prize || data.prize_label || data.prize || 'ПРИЗ ВЫДАН';
      setWonPrize({ title: prizeInfo, code });
      setPromoCodeInput('');
      setPromoFeedback(null);
    } catch (err) {
      setPromoFeedback({ type: 'error', message: err.message });
    } finally {
      setPromoLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainWrapper}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.yellowBar}></div>
            <div>
              <h1 style={styles.headerBrand}>COLIZEUM ADMIN</h1>
              <p style={styles.headerSub}>Администратор: {profile.username}</p>
            </div>
          </div>
          <span style={{ backgroundColor: '#FFE500', color: '#0E0E10', fontWeight: '900', fontSize: '9px', padding: '3px 6px', borderRadius: '4px' }}>ADMIN</span>
        </header>

        <section style={styles.adminCard}>
          <div style={styles.adminCardHeader}>
            <span style={{ fontSize: '22px' }}>🎟️</span>
            <div><h2 style={styles.adminCardTitle}>ПОГАШЕНИЕ ПРОМОКОДА</h2></div>
          </div>
          <form onSubmit={handleRedeem} style={styles.adminForm}>
            <div style={styles.inputGroup}>
              <input type="text" required placeholder="ПРОМОКОД" value={promoCodeInput} onChange={e => setPromoCodeInput(e.target.value)} style={{ ...styles.textInput, textTransform: 'uppercase' }} />
            </div>
            <div style={styles.inputGroup}>
              <select value={promoType} onChange={e => setPromoType(e.target.value)} style={styles.selectInput}>
                <option value="auto">Автоопределение</option>
                <option value="spin">Спин Колеса</option>
                <option value="daily">Ежедневный бонус</option>
              </select>
            </div>
            {promoFeedback && <div style={promoFeedback.type === 'success' ? styles.successBox : styles.errorBox}>{promoFeedback.message}</div>}
            <button type="submit" disabled={promoLoading} style={styles.submitButton}>{promoLoading ? 'ПРОВЕРКА...' : 'ПОГАСИТЬ ПРОМОКОД'}</button>
          </form>
        </section>

        <section style={styles.adminCard}>
          <div style={styles.adminCardHeader}>
            <span style={{ fontSize: '22px' }}>💳</span>
            <div><h2 style={styles.adminCardTitle}>КЛУБНАЯ ТРАНЗАКЦИЯ</h2></div>
          </div>
          <form onSubmit={handleTransaction} style={styles.adminForm}>
            <div style={styles.inputGroup}>
              <div style={styles.phoneBox}>
                <span style={styles.phonePrefix}>+7</span>
                <input type="tel" required maxLength="10" placeholder="9265714536" value={transPhone} onChange={e => setTransPhone(e.target.value)} style={styles.phoneField} />
              </div>
            </div>
            <div style={styles.inputGroup}>
              <input type="number" required placeholder="СУММА RUB" value={transAmount} onChange={e => setTransAmount(e.target.value.replace(/\D/g, ''))} style={styles.textInput} />
            </div>
            <div style={styles.inputGroup}>
              <input type="text" required placeholder="НОМЕР ЧЕКА" value={transCheckNumber} onChange={e => setTransCheckNumber(e.target.value)} style={styles.textInput} />
            </div>
            {transFeedback && <div style={transFeedback.type === 'success' ? styles.successBox : styles.errorBox}>{transFeedback.message}</div>}
            <button type="submit" disabled={transLoading} style={styles.submitButton}>{transLoading ? 'ПРОВОДИМ...' : 'ПРОВЕСТИ ТРАНЗАКЦИЮ'}</button>
          </form>
        </section>
      </div>
      {wonPrize && <WinnerModal wonPrize={wonPrize} onClose={() => setWonPrize(null)} isAdmin={true} />}
    </div>
  );
}