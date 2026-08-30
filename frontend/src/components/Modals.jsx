import React from 'react';
import { styles } from '../utils/styles';

export const copyToClipboard = (text, setCopiedCode) => {
  const WebApp = window.Telegram.WebApp;

  if (!text) return;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
  if (WebApp.HapticFeedback) WebApp.HapticFeedback.impactOccurred('light');
  if (setCopiedCode) {
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(''), 2500);
  }
};

export const PrizesModal = ({ userPromocodes, onClose, setCopiedCode }) => (
  <div style={styles.modalOverlay}>
    <div style={{ ...styles.modalCard, maxWidth: '340px' }}>
      <h2 style={{ color: '#FFE500', marginBottom: '4px', fontSize: '16px', fontWeight: '900' }}>МОИ ВЫИГРЫШИ 📜</h2>
      <p style={{ fontSize: '10px', color: '#888', marginBottom: '14px' }}>Покажите промокод администратору клуба</p>
      <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {userPromocodes.length === 0 ? (
          <p style={{ color: '#666', fontSize: '12px' }}>У вас пока нет выигранных промокодов.</p>
        ) : (
          userPromocodes.map((item, idx) => {
            const isItemRedeemed = item.is_redeemed ?? false;
            return (
              <div 
                key={idx} 
                onClick={() => !isItemRedeemed && copyToClipboard(item.promo_code, setCopiedCode)}
                style={{ ...styles.promoHistoryItem, cursor: isItemRedeemed ? 'default' : 'pointer' }}
              >
                <div>
                  <p style={{ fontWeight: 'bold', fontSize: '12px', color: '#FFF', margin: 0 }}>
                    {item.prize_label || item.prize_name || item.label || item.prize}
                  </p>
                  <p style={{ fontSize: '9px', color: '#666', margin: 0 }}>{new Date(item.spun_at).toLocaleDateString()}</p>
                </div>
                <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: isItemRedeemed ? '#777777' : '#FFE500', fontSize: '13px', textDecoration: isItemRedeemed ? 'line-through' : 'none' }}>
                  {item.promo_code}
                </span>
              </div>
            );
          })
        )}
      </div>
      <button onClick={onClose} style={styles.submitButton}>ЗАКРЫТЬ</button>
    </div>
  </div>
);

export const WinnerModal = ({ wonPrize, onClose, setCopiedCode, isAdmin }) => (
  <div style={styles.modalOverlay}>
    <div style={styles.modalCard}>
      <h2 style={{ color: '#FFE500', marginBottom: '8px', fontSize: '16px' }}>{isAdmin ? 'ПРОМОКОД ПОГАШЕН! 🎉' : 'ПОЗДРАВЛЯЕМ! 🎉'}</h2>
      <p style={{ fontSize: '14px', marginBottom: '12px' }}>{isAdmin ? 'Выигранный приз:' : 'Вы выиграли:'} <strong>{wonPrize.title}</strong></p>
      
      {!isAdmin && (
        <div onClick={() => copyToClipboard(wonPrize.code, setCopiedCode)} style={{ ...styles.promoBox, cursor: 'pointer' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 'bold', color: '#FFE500' }}>{wonPrize.code}</span>
        </div>
      )}
      
      <p style={{ fontSize: '10px', color: '#888', marginBottom: '16px' }}>
        {isAdmin ? 'Промокод успешно списан' : 'Покажите промокод администратору'}
      </p>
      <button onClick={onClose} style={styles.submitButton}>ОТЛИЧНО</button>
    </div>
  </div>
);