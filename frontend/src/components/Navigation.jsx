import React from 'react';
import { styles } from '../styles/styles';
import WheelLogo from './WheelLogo';

export default function Navigation({ activeTab, setActiveTab, refreshAppData }) {
  return (
    <div style={styles.navBar}>
      <button 
        onClick={() => {
          setActiveTab('hub');
          refreshAppData();
        }} 
        style={{
          ...styles.navButton,
          color: activeTab === 'hub' ? '#FFE500' : '#888',
          backgroundColor: activeTab === 'hub' ? '#292A31' : 'transparent'
        }}
      >
        🏠 HUB
      </button>
      <button
        onClick={() => setActiveTab('wheel')}
        style={{
          ...styles.navButton,
          color: activeTab === 'wheel' ? '#FFE500' : '#888',
          backgroundColor: activeTab === 'wheel' ? '#292A31' : 'transparent',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <WheelLogo size={18} /> КОЛЕСО
      </button>
      <button onClick={() => setActiveTab('daily')} style={{ ...styles.navButton, color: activeTab === 'daily' ? '#FFE500' : '#888', backgroundColor: activeTab === 'daily' ? '#292A31' : 'transparent' }}>🎁 БОНУС</button>
      <button onClick={() => setActiveTab('ladder')} style={{ ...styles.navButton, color: activeTab === 'ladder' ? '#FFE500' : '#888', backgroundColor: activeTab === 'ladder' ? '#292A31' : 'transparent' }}>🏆 LADDER</button>
    </div>
  );
}
