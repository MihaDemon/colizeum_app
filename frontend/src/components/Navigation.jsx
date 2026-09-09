import React from 'react';
import { styles } from '../styles/styles';

export default function Navigation({ activeTab, setActiveTab, refreshAppData }) {
  return (
    <div style={styles.navBar}>
      <button 
        onClick={() => {
          setActiveTab('hub');
          refreshAppData();
        }} 
        style={{ ...styles.navButton, color: activeTab === 'hub' ? '#FFE500' : '#888' }}
      >
        🏠 HUB
      </button>
      <button onClick={() => setActiveTab('wheel')} style={{ ...styles.navButton, color: activeTab === 'wheel' ? '#FFE500' : '#888' }}>🎡 КОЛЕСО</button>
      <button onClick={() => setActiveTab('daily')} style={{ ...styles.navButton, color: activeTab === 'daily' ? '#FFE500' : '#888' }}>🎁 БОНУС</button>
      <button onClick={() => setActiveTab('ladder')} style={{ ...styles.navButton, color: activeTab === 'ladder' ? '#FFE500' : '#888' }}>🏆 LADDER</button>
    </div>
  );
}
