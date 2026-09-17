import React, { useState } from 'react';
import { styles } from '../../styles/styles';
import { API_BASE_URL } from '../../constants/api';
import { adminTransactionApi, adminRedeemApi } from '../../services/api';
import WinnerModal from '../modals/WinnerModal';

export default function AdminView({ profile }) {
  const [transPhone, setTransPhone] = useState('');
  const [transAmount, setTransAmount] = useState('');
  const [transCheckNumber, setTransCheckNumber] = useState('');
  const [transLoading, setTransLoading] = useState(false);
  const [transFeedback, setTransFeedback] = useState(null);

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoFeedback, setPromoFeedback] = useState(null);

  const [wonPrize, setWonPrize] = useState(null);

  const handleAdminTransactionSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = transPhone.trim();

    if (!/^\d{10}$/.test(cleanPhone)) {
      setTransFeedback({ type: 'error', message: 'Введите ровно 10 цифр номера телефона (без +7).' });
      return;
    }

    if (!transAmount || !transCheckNumber.trim()) {
      setTransFeedback({ type: 'error', message: 'Заполните сумму и номер чека.' });
      return;
    }

    setTransLoading(true);
    setTransFeedback(null);

    try {
      await adminTransactionApi(cleanPhone, transAmount, transCheckNumber);
      setTransFeedback({
        type: 'success',
        message: `Чек ${transCheckNumber.trim()} на ${transAmount} RUB успешно проведен для +7${cleanPhone}!`
      });
      setTransPhone('');
      setTransAmount('');
      setTransCheckNumber('');
    } catch (err) {
      setTransFeedback({ type: 'error', message: err.message });
    } finally {
      setTransLoading(false);
    }
  };

  const handleAdminRedeemSubmit = async (e) => {
    e.preventDefault();
    const cleanedCode = promoCodeInput.trim().toUpperCase();
    if (!cleanedCode) {
      setPromoFeedback({ type: 'error', message: 'Введите промокод.' });
      return;
    }

    setPromoLoading(true);
    setPromoFeedback(null);

    const endpoint = `${API_BASE_URL}/api/daily-bonuses/redeem/`;

    try {
      const data = await adminRedeemApi(cleanedCode, endpoint);
      const prizeInfo = 
        data.spin?.prize || 
        data.spin?.prize_name || 
        data.spin?.prize?.name || 
        data.bonus?.prize || 
        data.bonus?.prize_name || 
        data.bonus?.prize?.name || 
        data.prize_label || 
        data.prize || 
        'ПРИЗ ВЫДАН';

      setWonPrize({
        title: prizeInfo,
        code: cleanedCode
      });

      setPromoCodeInput('');
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
              <p style={styles.headerSub}>
                {profile?.username ? `Администратор: ${profile.username}` : 'Панель управления'}
              </p>
            </div>
          </div>
          <span style={{ backgroundColor: '#FFE500', color: '#0E0E10', fontWeight: '900', fontSize: '9px', padding: '3px 6px', borderRadius: '4px' }}>ADMIN</span>
        </header>

        {/* DAILY BONUS PROMOCODE REDEEM FORM */}
        <section style={styles.adminCard}>
          <div style={styles.adminCardHeader}>
            <span style={{ fontSize: '22px' }}>🎟️</span>
            <div>
              <h2 style={styles.adminCardTitle}>ПОГАШЕНИЕ ПРОМОКОДА</h2>
              <p style={styles.adminCardSub}>Активация ежедневного бонуса</p>
            </div>
          </div>

          <form onSubmit={handleAdminRedeemSubmit} style={styles.adminForm}>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>ПРОМОКОД ИГРОКА</label>
              <input
                type="text"
                required
                placeholder="DAILY-ABC123XYZ"
                value={promoCodeInput}
                onChange={(e) => setPromoCodeInput(e.target.value)}
                style={{ ...styles.textInput, textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 'bold', color: '#FFE500', fontSize: '14px' }}
              />
            </div>

            {promoFeedback && (
              <div style={promoFeedback.type === 'success' ? styles.successBox : styles.errorBox}>
                {promoFeedback.type === 'success' ? '🎉 ' : '❌ '}
                {promoFeedback.message}
              </div>
            )}

            <button type="submit" disabled={promoLoading} style={styles.submitButton}>
              {promoLoading ? 'ПРОВЕРКА...' : 'ПОГАСИТЬ DAILY БОНУС 📜'}
            </button>
          </form>
        </section>

        {/* CLUB TRANSACTION FORM */}
        <section style={styles.adminCard}>
          <div style={styles.adminCardHeader}>
            <span style={{ fontSize: '22px' }}>💳</span>
            <div>
              <h2 style={styles.adminCardTitle}>КЛУБНАЯ ТРАНЗАКЦИЯ</h2>
              <p style={styles.adminCardSub}>Проведение чеков и пополнений администратором</p>
            </div>
          </div>

          <form onSubmit={handleAdminTransactionSubmit} style={styles.adminForm}>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>НОМЕР ТЕЛЕФОНА ИГРОКА (10 ЦИФР)</label>
              <div style={styles.phoneBox}>
                <span style={styles.phonePrefix}>+7</span>
                <input
                  type="tel"
                  required
                  maxLength="10"
                  placeholder="9265714536"
                  value={transPhone}
                  onChange={(e) => setTransPhone(e.target.value)}
                  style={styles.phoneField}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>СУММА (RUB, ТОЛЬКО ЦЕЛЫЕ)</label>
              <input
                type="number"
                step="1"
                pattern="\d*"
                required
                placeholder="1500"
                value={transAmount}
                onChange={(e) => setTransAmount(e.target.value.replace(/\D/g, ''))}
                style={styles.textInput}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>НОМЕР ЧЕКА / КАССЫ</label>
              <input
                type="text"
                required
                placeholder="FD-987654321"
                value={transCheckNumber}
                onChange={(e) => setTransCheckNumber(e.target.value)}
                style={{ ...styles.textInput, textTransform: 'uppercase' }}
              />
            </div>

            {transFeedback && (
              <div style={transFeedback.type === 'success' ? styles.successBox : styles.errorBox}>
                {transFeedback.type === 'success' ? '✅ ' : '⚠️ '}
                {transFeedback.message}
              </div>
            )}

            <button type="submit" disabled={transLoading} style={styles.submitButton}>
              {transLoading ? 'ПРОВОДИМ...' : 'ПРОВЕСТИ ТРАНЗАКЦИЮ ⚡'}
            </button>
          </form>
        </section>

      </div>

      <WinnerModal wonPrize={wonPrize} setWonPrize={setWonPrize} isAdmin={true} />
    </div>
  );
}
