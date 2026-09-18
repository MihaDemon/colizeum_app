import React from 'react';
import { styles } from '../../styles/styles';
import WheelLogo from '../WheelLogo';
import DailyBonusLogo from '../DailyBonusLogo';
import LadderLogo from '../LadderLogo';
import HubLogo from '../HubLogo';

export default function HubView({ profile, ladderRank, setActiveTab, canClaimBonus }) {
  return (
    <>
      <div style={styles.userCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={styles.avatarBox}><HubLogo size={30} /></div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#FFF', margin: 0 }}>
              {profile?.username || profile?.app_username || 'Игрок'}
            </h3>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '9px', color: '#FFE500', fontWeight: 'bold', display: 'block', letterSpacing: '1px' }}>LADDER RANK</span>
          <span style={{ fontSize: '16px', fontWeight: '900', color: '#FFF' }}>#{ladderRank}</span>
        </div>
      </div>

      <div onClick={() => setActiveTab('ladder')} style={styles.menuCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LadderLogo size={30} />
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#FFF', margin: 0 }}>MONTHLY LADDER</h4>
            <p style={{ fontSize: '10px', color: '#888', margin: '2px 0 0 0' }}>Ежемесячный рейтинг игроков</p>
          </div>
        </div>
        <span style={{ color: '#FFE500', fontWeight: '900', fontSize: '16px' }}>➔</span>
      </div>

      <div onClick={() => setActiveTab('wheel')} style={styles.wheelMenuCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <WheelLogo size={30} />
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#FFE500', margin: 0 }}>FORTUNE WHEEL</h4>
            <p style={{ fontSize: '10px', color: '#CCC', margin: '2px 0 0 0' }}>Испытай удачу и выигрывай бонусы!</p>
          </div>
        </div>
        <span style={{ backgroundColor: '#FFE500', color: '#0E0E10', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '12px' }}>➔</span>
      </div>

      {/* Daily Bonus Card */}
      <div 
        onClick={() => setActiveTab('daily')} 
        style={{
          ...styles.menuCard,
          ...(canClaimBonus ? {
            border: '2px solid #FFE500',
            animation: 'pulseGlow 2.5s ease-in-out infinite',
            transition: 'all 0.3s ease-in-out'
          } : {})
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <DailyBonusLogo size={30} />
          <div>
            <h4 style={{ 
              fontSize: '13px', 
              fontWeight: '900', 
              margin: 0,
              ...(canClaimBonus ? {
                background: 'linear-gradient(270deg, #FFE500, #FF007A, #00E5FF, #FFE500)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'animatedGradient 4s ease infinite'
              } : { color: '#FFF' })
            }}>
              DAILY BONUS
            </h4>
            <p style={{ fontSize: '10px', color: canClaimBonus ? '#EEE' : '#888', margin: '2px 0 0 0' }}>
              {canClaimBonus ? 'Ваша ежедневная награда готова!' : 'Забирай награды за ежедневный вход в игру'}
            </p>
          </div>
        </div>
        <span style={{ 
          color: canClaimBonus ? '#0E0E10' : '#FFE500', 
          backgroundColor: canClaimBonus ? '#FFE500' : 'transparent',
          width: canClaimBonus ? '28px' : 'auto',
          height: canClaimBonus ? '28px' : 'auto',
          borderRadius: canClaimBonus ? '50%' : '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '900', 
          fontSize: '14px' 
        }}>➔</span>
      </div>

      <div style={styles.statsFooter}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontSize: '9px', color: '#888', margin: 0, textTransform: 'uppercase' }}>Стрик</p>
          <p style={{ fontSize: '13px', fontWeight: '900', color: '#FFE500', margin: '2px 0 0 0' }}>{profile?.daily_streak ?? 0} дней</p>
        </div>
        <div style={{ width: '1px', backgroundColor: '#2A2A32' }}></div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontSize: '9px', color: '#888', margin: 0, textTransform: 'uppercase' }}>Всего спинов</p>
          <p style={{ fontSize: '13px', fontWeight: '900', color: '#FFF', margin: '2px 0 0 0' }}>{profile?.total_spins ?? 0}</p>
        </div>
      </div>
    </>
  );
}
