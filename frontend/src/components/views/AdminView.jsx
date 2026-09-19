import React, { useCallback, useEffect, useState } from 'react';
import { styles } from '../../styles/styles';
import { API_BASE_URL } from '../../constants/api';
import { adminRedeemApi, fetchAdminTransactionsApi } from '../../services/api';
import WinnerModal from '../modals/WinnerModal';

export default function AdminView({ profile }) {
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoFeedback, setPromoFeedback] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState(null);

  const [wonPrize, setWonPrize] = useState(null);

  const loadTransactions = useCallback(async () => {
    setTransactionsLoading(true);
    setTransactionsError(null);
    try {
      const data = await fetchAdminTransactionsApi();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      setTransactionsError(err.message);
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
    const refreshTimer = setInterval(loadTransactions, 15 * 60 * 1000);
    return () => clearInterval(refreshTimer);
  }, [loadTransactions]);

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

        {/* AUTOMATIC CLUB TRANSACTIONS */}
        <section style={styles.adminCard}>
          <div style={{ ...styles.adminCardHeader, justifyContent: 'space-between' }}>
            <div style={styles.adminCardHeader}>
              <span style={{ fontSize: '22px' }}>💳</span>
              <div>
                <h2 style={styles.adminCardTitle}>АВТОМАТИЧЕСКИЕ ТРАНЗАКЦИИ</h2>
                <p style={styles.adminCardSub}>Синхронизация с клубом каждые 15 минут</p>
              </div>
            </div>
            <button
              type="button"
              onClick={loadTransactions}
              disabled={transactionsLoading}
              style={{ ...styles.submitButton, width: 'auto', padding: '8px 10px', fontSize: '9px' }}
            >
              {transactionsLoading ? '...' : 'ОБНОВИТЬ'}
            </button>
          </div>

          {transactionsError && (
            <div style={styles.errorBox}>{transactionsError}</div>
          )}

          {!transactionsLoading && !transactionsError && transactions.length === 0 && (
            <p style={{ color: '#888', fontSize: '11px', margin: 0 }}>
              Обработанных транзакций пока нет.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {transactions.map((item) => (
              <div key={item.check_number} style={styles.winHistoryItem}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ color: '#FFF', fontSize: '11px', fontWeight: '800' }}>
                    ЧЕК №{item.check_number}
                  </div>
                  <div style={{ color: '#888', fontSize: '9px', marginTop: '3px' }}>
                    {item.created_at ? new Date(item.created_at).toLocaleString() : '—'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#FFE500', fontSize: '12px', fontWeight: '900' }}>
                    {item.amount_rub} RUB
                  </div>
                  <div style={{ color: '#8BC34A', fontSize: '9px', fontWeight: '800', marginTop: '3px' }}>
                    +{item.spins_awarded} СПИНОВ
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      <WinnerModal wonPrize={wonPrize} setWonPrize={setWonPrize} isAdmin={true} />
    </div>
  );
}
