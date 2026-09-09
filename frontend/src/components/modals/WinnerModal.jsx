import React from 'react';
import { styles } from '../../styles/styles';

export default function WinnerModal({ wonPrize, setWonPrize, copyToClipboard, isAdmin = false }) {
  if (!wonPrize) return null;

  if (isAdmin) {
    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modalCard}>
          <h2 style={{ color: '#FFE500', marginBottom: '12px', fontSize: '16px', fontWeight: '900' }}>ПРОМОКОД ПОГАШЕН! 🎉</h2>
          
          <div style={{ ...styles.promoBox, padding: '14px', margin: '12px 0' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#FFFFFF' }}>
              Выигранный приз: <span style={{ color: '#FFE500', textTransform: 'uppercase' }}>{wonPrize.title}</span>
            </span>
          </div>

          <p style={{ fontSize: '10px', color: '#888', marginBottom: '16px' }}>Промокод успешно списан с аккаунта игрока</p>
          <button onClick={() => setWonPrize(null)} style={styles.submitButton}>ОТЛИЧНО</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalCard}>
        <h2 style={{ color: '#FFE500', marginBottom: '8px', fontSize: '16px' }}>ПОЗДРАВЛЯЕМ! 🎉</h2>
        <p style={{ fontSize: '14px', marginBottom: '12px' }}>Вы выиграли: <strong>{wonPrize.title}</strong></p>
        <div 
          onClick={() => copyToClipboard(wonPrize.code)} 
          title="Нажмите, чтобы скопировать"
          style={{ ...styles.promoBox, cursor: 'pointer' }}
        >
          <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 'bold', color: '#FFE500' }}>{wonPrize.code}</span>
        </div>
        <p style={{ fontSize: '10px', color: '#888', marginBottom: '16px' }}>Покажите промокод администратору клуба</p>
        <button onClick={() => setWonPrize(null)} style={styles.submitButton}>ОТЛИЧНО</button>
      </div>
    </div>
  );
}
