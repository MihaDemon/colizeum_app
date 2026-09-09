import React from 'react';
import { styles } from '../styles/styles';

export default function Header({ profile, setActiveTab, refreshAppData, setShowPrizesModal }) {
  return (
    <header style={styles.header}>
      <div 
        style={styles.headerLeft} 
        onClick={() => {
          setActiveTab('hub');
          refreshAppData();
        }}
        title="Обновить данные"
      >
        <div style={styles.yellowBar}></div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={styles.headerBrand}>COLIZEUM</h1>
          <p style={styles.headerSub}>Перово ARENA HUB</p>
        </div>
      </div>

      <div style={styles.headerRight}>
        <div style={styles.pointsBadge}>
          <span style={styles.ptsLabel}>SPN:</span>
          <span style={styles.ptsValue}>{profile?.available_spins ?? 0}</span>
        </div>
        <button 
          onClick={() => setShowPrizesModal(true)} 
          style={styles.promocodeButton}
          title="Мои промокоды"
        >
          📜
        </button>
      </div>
    </header>
  );
}
