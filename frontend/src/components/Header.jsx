import React from 'react';
import { styles } from '../styles/styles';
import PromoRefreshLogo from './PromoRefreshLogo';

export default function Header({ profile, setActiveTab, refreshAppData, setShowPrizesModal }) {
  const handleRefresh = () => {
    refreshAppData();
  };

  const handleWinsClick = async () => {
    setShowPrizesModal(true);
    await refreshAppData();
  };

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
        <button
          type="button"
          onClick={handleRefresh}
          style={{ ...styles.pointsBadge, cursor: 'pointer' }}
          title="Обновить количество спинов"
          aria-label="Обновить количество спинов"
        >
          <span style={styles.ptsLabel}>SPN:</span>
          <span style={styles.ptsValue}>{profile?.available_spins ?? 0}</span>
        </button>
        <button
          type="button"
          onClick={handleWinsClick}
          style={styles.winsButton}
          title="Обновить мои промокоды и выигрыши"
          aria-label="Обновить мои промокоды и выигрыши"
        >
          <PromoRefreshLogo size={24} />
        </button>
      </div>
    </header>
  );
}
