import React, { useState } from 'react';
import { apiClaimDailyBonus, apiSpinWheel } from '../api/client';
import { copyToClipboard } from '../components/Modals';
import { styles } from '../utils/styles';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

export const HubView = ({ profile, ladderRank, setActiveTab }) => (
  <>
    <div style={styles.userCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={styles.avatarBox}>👑</div>
        <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#FFF', margin: 0 }}>{profile?.username || 'Игрок'}</h3>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontSize: '9px', color: '#FFE500', fontWeight: 'bold', display: 'block' }}>LADDER RANK</span>
        <span style={{ fontSize: '16px', fontWeight: '900', color: '#FFF' }}>#{ladderRank}</span>
      </div>
    </div>

    <div onClick={() => setActiveTab('ladder')} style={styles.menuCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '22px' }}>🏆</span>
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#FFF', margin: 0 }}>MONTHLY LADDER</h4>
          <p style={{ fontSize: '10px', color: '#888', margin: '2px 0 0 0' }}>Ежемесячный рейтинг игроков</p>
        </div>
      </div>
      <span style={{ color: '#FFE500', fontWeight: '900', fontSize: '16px' }}>➔</span>
    </div>

    <div onClick={() => setActiveTab('wheel')} style={styles.wheelMenuCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '24px' }}>🎡</span>
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#FFE500', margin: 0 }}>FORTUNE WHEEL</h4>
          <p style={{ fontSize: '10px', color: '#CCC', margin: '2px 0 0 0' }}>Крути колесо и выигрывай!</p>
        </div>
      </div>
    </div>

    <div onClick={() => setActiveTab('daily')} style={{ ...styles.menuCard, border: profile?.can_claim_daily_bonus ? '2px solid #FFE500' : '1px solid #2A2A32' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '22px' }}>🎁</span>
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#FFF', margin: 0 }}>DAILY BONUS</h4>
          <p style={{ fontSize: '10px', color: '#888', margin: '2px 0 0 0' }}>Ежедневные награды за вход</p>
        </div>
      </div>
    </div>

    <div style={styles.statsFooter}>
      <div style={{ flex: 1, textAlign: 'center' }}>
        <p style={{ fontSize: '9px', color: '#888', margin: 0 }}>СТРИК</p>
        <p style={{ fontSize: '13px', fontWeight: '900', color: '#FFE500', margin: '2px 0 0 0' }}>{profile?.daily_streak ?? 0} дней</p>
      </div>
      <div style={{ width: '1px', backgroundColor: '#2A2A32' }}></div>
      <div style={{ flex: 1, textAlign: 'center' }}>
        <p style={{ fontSize: '9px', color: '#888', margin: 0 }}>СПИНОВ</p>
        <p style={{ fontSize: '13px', fontWeight: '900', color: '#FFF', margin: '2px 0 0 0' }}>{profile?.total_spins ?? 0}</p>
      </div>
    </div>
  </>
);

export const DailyBonusView = ({ profile, latestDailyBonus, refreshData, setCopiedCode }) => {
  const [isOpening, setIsOpening] = useState(false);
  const canClaim = profile?.can_claim_daily_bonus;
  const isRedeemed = latestDailyBonus?.is_redeemed ?? false;

  const claim = async () => {
    if (isOpening || !canClaim) return;
    setIsOpening(true);
    try {
      const res = await apiClaimDailyBonus();
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTimeout(() => { setIsOpening(false); refreshData(); }, 600);
    } catch (err) { alert(err.message); setIsOpening(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0' }}>
      <h3 style={{ color: '#FFE500', fontSize: '18px', fontWeight: '900' }}>DAILY BONUS 🎁</h3>
      
      {canClaim ? (
        <button onClick={claim} disabled={isOpening} style={{ width: '260px', height: '260px', backgroundColor: '#18181C', border: '3px solid #FFE500', borderRadius: '30px', fontSize: '110px', marginTop: '20px', cursor: 'pointer', boxShadow: '0 0 25px rgba(255, 229, 0, 0.3)' }}>🎁</button>
      ) : (
        <div style={{ width: '260px', textAlign: 'center', marginTop: '20px' }}>
          <h4 style={{ fontSize: '22px', fontWeight: '900', color: '#FFE500', textTransform: 'uppercase' }}>{latestDailyBonus?.prize || 'БОНУС'}</h4>
          <div onClick={() => !isRedeemed && copyToClipboard(latestDailyBonus?.promo_code, setCopiedCode)} style={{ backgroundColor: '#0E0E10', border: `1px dashed ${isRedeemed ? '#55' : '#FFE500'}`, padding: '12px', borderRadius: '12px', margin: '14px 0', cursor: isRedeemed ? 'default' : 'pointer' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: '900', color: isRedeemed ? '#777' : '#FFE500', fontSize: '15px', textDecoration: isRedeemed ? 'line-through' : 'none' }}>
              {latestDailyBonus?.promo_code || 'DAILY-BONUS'}
            </span>
          </div>
          <p style={{ color: '#888', fontSize: '12px' }}>{isRedeemed ? 'Использован' : `До: ${formatDate(latestDailyBonus?.use_until)}`}</p>
        </div>
      )}
    </div>
  );
};

export const LadderView = ({ profile, leaderboardList }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    <div style={{ textAlign: 'center', marginBottom: '4px' }}><h3 style={{ color: '#FFE500', fontSize: '18px', fontWeight: '900', margin: 0 }}>MONTHLY LADDER 🏆</h3></div>
    <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {leaderboardList.map((player) => {
        const isMe = player.username === profile?.username;
        return (
          <div key={player.id} style={{ ...styles.leaderboardItem, border: isMe ? '1px solid #FFE500' : '1px solid #2A2A32', backgroundColor: isMe ? '#18181C' : '#0E0E10' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: '900', color: player.position === 1 ? '#FFE500' : '#888' }}>#{player.position}</span>
              <div><p style={{ fontWeight: 'bold', fontSize: '13px', color: '#FFF', margin: 0 }}>{player.username} {isMe && '(Вы)'}</p></div>
            </div>
            <span style={{ fontWeight: '900', color: '#FFE500' }}>{player.monthly_points} PTS</span>
          </div>
        );
      })}
    </div>
  </div>
);

export const WheelView = ({ profile, refreshData, setWonPrize }) => {
  const [isSpinning, setIsSpinning] = useState(false);

  const spin = async () => {
    if (isSpinning || !profile?.can_spin) return;
    setIsSpinning(true);
    try {
      const res = await apiSpinWheel();
      const spinData = await res.json();
      if (!res.ok) throw new Error(spinData.error);
      
      setWonPrize({ title: spinData.prize_name || 'БОНУС', code: spinData.promo_code });
      refreshData();
    } catch (e) { alert(e.message); } 
    finally { setIsSpinning(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
      <button onClick={spin} disabled={isSpinning || !profile?.can_spin} style={{ ...styles.submitButton, width: '220px', height: '220px', borderRadius: '50%', fontSize: '16px' }}>
        {isSpinning ? 'КРУТИМ...' : 'КРУТИТЬ КОЛЕСО'}
      </button>
    </div>
  );
};