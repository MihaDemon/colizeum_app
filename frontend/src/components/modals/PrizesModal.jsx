import React from 'react';
import { styles } from '../../styles/styles';

export default function PrizesModal({ showPrizesModal, setShowPrizesModal, userSpins }) {
  if (!showPrizesModal) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={{ ...styles.modalCard, maxWidth: '340px' }}>
        <h2 style={{ color: '#FFE500', marginBottom: '4px', fontSize: '16px', fontWeight: '900' }}>МОИ ВЫИГРЫШИ 🎁</h2>
        <p style={{ fontSize: '10px', color: '#888', marginBottom: '14px' }}>История бонусов, выигранных на колесе COLIZEUM</p>

        <div 
          className="no-scrollbar" 
          style={{ 
            maxHeight: '220px', 
            overflowY: 'auto', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px', 
            marginBottom: '16px',
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none'
          }}
        >
          {userSpins.length === 0 ? (
            <p style={{ color: '#666', fontSize: '12px' }}>У вас пока нет выигранных бонусов.</p>
          ) : (
            userSpins.map((item, idx) => {
              return (
                <div 
                  key={item.id ?? idx}
                  style={{ 
                    ...styles.winHistoryItem
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 'bold', fontSize: '12px', color: '#FFF', margin: 0 }}>
                      {item.prize || 'БОНУС'}
                    </p>
                    <p style={{ fontSize: '9px', color: '#666', margin: 0 }}>{new Date(item.spun_at).toLocaleDateString()}</p>
                  </div>
                  <span style={{ fontWeight: '900', color: '#FFE500', fontSize: '13px' }}>
                    +{item.bonus_amount ?? 0} БОНУСОВ
                  </span>
                </div>
              );
            })
          )}
        </div>

        <button onClick={() => setShowPrizesModal(false)} style={styles.submitButton}>ЗАКРЫТЬ</button>
      </div>
    </div>
  );
}
