import React from 'react';
import { styles } from '../../styles/styles';

export default function PrizesModal({ showPrizesModal, setShowPrizesModal, userPromocodes, copyToClipboard }) {
  if (!showPrizesModal) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={{ ...styles.modalCard, maxWidth: '340px' }}>
        <h2 style={{ color: '#FFE500', marginBottom: '4px', fontSize: '16px', fontWeight: '900' }}>МОИ ВЫИГРЫШИ 📜</h2>
        <p style={{ fontSize: '10px', color: '#888', marginBottom: '14px' }}>Покажите промокод администратору клуба COLIZEUM</p>

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
          {userPromocodes.length === 0 ? (
            <p style={{ color: '#666', fontSize: '12px' }}>У вас пока нет выигранных промокодов.</p>
          ) : (
            userPromocodes.map((item, idx) => {
              const isItemRedeemed = item.is_redeemed ?? false;
              return (
                <div 
                  key={idx} 
                  onClick={() => {
                    if (!isItemRedeemed) {
                      copyToClipboard(item.promo_code);
                    }
                  }}
                  title={isItemRedeemed ? "Промокод использован" : "Нажмите, чтобы скопировать"}
                  style={{ 
                    ...styles.promoHistoryItem, 
                    cursor: isItemRedeemed ? 'default' : 'pointer' 
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 'bold', fontSize: '12px', color: '#FFF', margin: 0 }}>
                      {item.prize_label || item.prize_name || item.label || item.prize}
                    </p>
                    <p style={{ fontSize: '9px', color: '#666', margin: 0 }}>{new Date(item.spun_at).toLocaleDateString()}</p>
                  </div>
                  <span style={{ 
                    fontFamily: 'monospace', 
                    fontWeight: 'bold', 
                    color: isItemRedeemed ? '#777777' : '#FFE500', 
                    fontSize: '13px',
                    textDecoration: isItemRedeemed ? 'line-through' : 'none'
                  }}>
                    {item.promo_code}
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
