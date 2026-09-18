import React from 'react';
import { styles } from '../styles/styles';
import WheelLogo from './WheelLogo';
import DailyBonusLogo from './DailyBonusLogo';
import LadderLogo from './LadderLogo';
import HubLogo from './HubLogo';

export default function Navigation({ activeTab, setActiveTab, refreshAppData }) {
  const showLabel = (tab) => activeTab !== tab;

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
          backgroundColor: activeTab === 'hub' ? '#292A31' : 'transparent',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}
      >
        <HubLogo size={17} />
        {showLabel('hub') && <span>HUB</span>}
      </button>
      <button
        onClick={() => setActiveTab('wheel')}
        style={{
          ...styles.navButton,
          color: activeTab === 'wheel' ? '#FFE500' : '#888',
          backgroundColor: activeTab === 'wheel' ? '#292A31' : 'transparent',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}
      >
        <WheelLogo size={18} />
        {showLabel('wheel') && <span>КОЛЕСО</span>}
      </button>
      <button
        onClick={() => setActiveTab('daily')}
        style={{
          ...styles.navButton,
          color: activeTab === 'daily' ? '#FFE500' : '#888',
          backgroundColor: activeTab === 'daily' ? '#292A31' : 'transparent',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}
      >
        <DailyBonusLogo size={17} />
        {showLabel('daily') && <span>БОНУС</span>}
      </button>
      <button
        onClick={() => setActiveTab('ladder')}
        style={{
          ...styles.navButton,
          color: activeTab === 'ladder' ? '#FFE500' : '#888',
          backgroundColor: activeTab === 'ladder' ? '#292A31' : 'transparent',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}
      >
        <LadderLogo size={17} />
        {showLabel('ladder') && <span>LADDER</span>}
      </button>
    </div>
  );
}
