import React, { useState, useEffect } from 'react';
import { apiAuthenticate, apiFetchProfile, apiFetchPosition, apiFetchLeaderboard, apiFetchPromocodes, apiFetchDailyBonus } from './api/client';
import { styles } from './utils/styles';
import { PrizesModal, WinnerModal } from './components/Modals';
import AdminPanel from './pages/AdminPanel';
import Register from './pages/Register';
import { HubView, DailyBonusView, LadderView, WheelView } from './pages/PlayerViews';

const WebApp = window.Telegram.WebApp;

export default function App() {
  const [profile, setProfile] = useState(null);
  const [ladderRank, setLadderRank] = useState('--');
  const [leaderboardList, setLeaderboardList] = useState([]);
  const [userPromocodes, setUserPromocodes] = useState([]);
  const [latestDailyBonus, setLatestDailyBonus] = useState(null);
  
  const [activeTab, setActiveTab] = useState('hub');
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showPrizesModal, setShowPrizesModal] = useState(false);
  const [wonPrize, setWonPrize] = useState(null);
  const [copiedCode, setCopiedCode] = useState('');

  const refreshAppData = async () => {
    try {
      const [prof, rank, ladder, promos, daily] = await Promise.all([
        apiFetchProfile(), apiFetchPosition(), apiFetchLeaderboard(), apiFetchPromocodes(), apiFetchDailyBonus()
      ]);
      setProfile(prof);
      setLadderRank(rank.position ?? '--');
      setLeaderboardList(Array.isArray(ladder) ? ladder : []);
      setUserPromocodes(Array.isArray(promos) ? promos : []);
      setLatestDailyBonus(daily);
    } catch (e) { console.error(e); }
  };

  const authUser = async (payloadData = {}) => {
  const initData = WebApp.initData;
  if (!initData) {
    setError('Пожалуйста, откройте приложение через Telegram.');
    setIsLoading(false);
    return;
  }

  try {
    const res = await apiAuthenticate(initData, payloadData);
    const data = await res.json();

    // 1. Handle HTTP errors or explicit registration flags
    if (!res.ok) {
      // If backend signals registration needed via status 400/404 payload
      if (data.require_registration) {
        setError(null); // Clear error state so the screen isn't blocked
        setNeedsRegistration(true);
        return;
      }
      throw new Error(data.error || data.detail || 'Ошибка авторизации');
    }

    // 2. Handle 200 OK registration response
    if (data.require_registration || (data.is_new_user && !data.username && !payloadData.username)) {
      setError(null);
      setNeedsRegistration(true);
    } else {
      localStorage.setItem('auth_token', data.token);
      await refreshAppData();
      setError(null);
      setNeedsRegistration(false);
    }
  } catch (err) {
    // Only set error for actual network/server failures
    setError(err.message);
  } finally {
    setIsLoading(false);
    setIsSubmitting(false);
  }
};

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    authUser();
  }, []);

  if (isLoading) return <div style={styles.container}><h2>Загрузка...</h2></div>;
  if (error && !profile) return <div style={styles.container}><h2>⚠️ {error}</h2></div>;
  if (profile?.is_staff) return <AdminPanel profile={profile} />;
  
  if (needsRegistration) return (
    <Register 
      submitRegistration={(data) => { setIsSubmitting(true); authUser(data); }} 
      isSubmitting={isSubmitting} error={error} 
    />
  );

  return (
    <div style={styles.container}>
      {copiedCode && <div style={styles.toastNotification}>📋 Скопировано: <strong>{copiedCode}</strong></div>}

      <div style={styles.mainWrapper}>
        <header style={styles.header}>
          <div style={styles.headerLeft} onClick={() => { setActiveTab('hub'); refreshAppData(); }}>
            <div style={styles.yellowBar}></div>
            <div><h1 style={styles.headerBrand}>COLIZEUM</h1><p style={styles.headerSub}>ARENA HUB</p></div>
          </div>
          <div style={styles.headerRight}>
            <div style={styles.pointsBadge}><span style={styles.ptsLabel}>SPN:</span><span style={styles.ptsValue}>{profile?.available_spins ?? 0}</span></div>
            <button onClick={() => setShowPrizesModal(true)} style={styles.promocodeButton}>📜</button>
          </div>
        </header>

        {activeTab === 'hub' && <HubView profile={profile} ladderRank={ladderRank} setActiveTab={setActiveTab} />}
        {activeTab === 'wheel' && <WheelView profile={profile} refreshData={refreshAppData} setWonPrize={setWonPrize} />}
        {activeTab === 'daily' && <DailyBonusView profile={profile} latestDailyBonus={latestDailyBonus} refreshData={refreshAppData} setCopiedCode={setCopiedCode} />}
        {activeTab === 'ladder' && <LadderView profile={profile} leaderboardList={leaderboardList} />}

        <div style={styles.navBar}>
          <button onClick={() => { setActiveTab('hub'); refreshAppData(); }} style={{ ...styles.navButton, color: activeTab === 'hub' ? '#FFE500' : '#888' }}>🏠 HUB</button>
          <button onClick={() => setActiveTab('wheel')} style={{ ...styles.navButton, color: activeTab === 'wheel' ? '#FFE500' : '#888' }}>🎡 КОЛЕСО</button>
          <button onClick={() => setActiveTab('daily')} style={{ ...styles.navButton, color: activeTab === 'daily' ? '#FFE500' : '#888' }}>🎁 БОНУС</button>
          <button onClick={() => setActiveTab('ladder')} style={{ ...styles.navButton, color: activeTab === 'ladder' ? '#FFE500' : '#888' }}>🏆 LADDER</button>
        </div>
      </div>

      {showPrizesModal && <PrizesModal userPromocodes={userPromocodes} onClose={() => setShowPrizesModal(false)} setCopiedCode={setCopiedCode} />}
      {wonPrize && <WinnerModal wonPrize={wonPrize} onClose={() => setWonPrize(null)} setCopiedCode={setCopiedCode} isAdmin={false} />}
    </div>
  );
}