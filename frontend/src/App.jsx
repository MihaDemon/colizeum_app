import React, { useState, useEffect } from 'react';
import './App.css';
import { styles } from './styles/styles';
import { getAuthToken, copyToClipboard as handleCopy } from './utils/helpers';
import { 
  fetchProfileApi, 
  fetchUserPositionApi, 
  fetchGlobalLeaderboardApi, 
  fetchSpinsApi,
  fetchDailyBonusesApi, 
  fetchWheelPrizesApi, 
  authenticateUserApi 
} from './services/api';

import Header from './components/Header';
import Navigation from './components/Navigation';
import Toast from './components/Toast';
import PrizesModal from './components/modals/PrizesModal';
import WinnerModal from './components/modals/WinnerModal';

import AdminView from './components/views/AdminView';
import RegistrationView from './components/views/RegistrationView';
import HubView from './components/views/HubView';
import WheelView from './components/views/WheelView';
import DailyBonusView from './components/views/DailyBonusView';
import LeaderboardView from './components/views/LeaderboardView';

export default function App() {
  const [profile, setProfile] = useState(null);
  const [ladderRank, setLadderRank] = useState('--');
  const [leaderboardList, setLeaderboardList] = useState([]);
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hub');

  // Modal states
  const [showPrizesModal, setShowPrizesModal] = useState(false);
  const [userSpins, setUserSpins] = useState([]);
  const [wonPrize, setWonPrize] = useState(null);

  // Copy Feedback Toast State
  const [copiedCode, setCopiedCode] = useState('');

  // Daily Bonus states
  const [latestDailyBonus, setLatestDailyBonus] = useState(null);

  // Wheel states
  const [wheelPrizes, setWheelPrizes] = useState([]);

  const copyToClipboard = (text) => handleCopy(text, setCopiedCode);

  const fetchProfile = async (token) => {
    try {
      const userData = await fetchProfileApi(token);
      setProfile(userData);
    } catch (err) {
      console.error("Ошибка при обновлении профиля", err);
    }
  };

  const fetchUserPosition = async (token) => {
    try {
      const data = await fetchUserPositionApi(token);
      setLadderRank(data.position ?? '--');
    } catch (err) {
      console.error("Ошибка при загрузке позиции в лидерборде", err);
    }
  };

  const fetchGlobalLeaderboard = async (token) => {
    try {
      const data = await fetchGlobalLeaderboardApi(token);
      setLeaderboardList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Ошибка при загрузке общего лидерборда", err);
    }
  };

  const fetchSpins = async (token) => {
    try {
      const data = await fetchSpinsApi(token);
      setUserSpins(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Ошибка при загрузке выигрышей", err);
    }
  };

  const fetchDailyBonuses = async (token) => {
    try {
      const data = await fetchDailyBonusesApi(token);
      setLatestDailyBonus(data);
    } catch (err) {
      console.error("Ошибка при загрузке последнего ежедневного бонуса", err);
    }
  };

  const refreshAppData = async () => {
    const token = getAuthToken();
    if (!token) return;
    await Promise.all([
      fetchProfile(token),
      fetchUserPosition(token),
      fetchSpins(token),
      fetchDailyBonuses(token)
    ]);
  };

  const authenticateUser = async (payloadData = {}) => {
    try {
      const data = await authenticateUserApi(payloadData);

      if (data.require_registration || (data.is_new_user && !data.username && !payloadData.username)) {
        setNeedsRegistration(true);
        setIsLoading(false);
        return;
      }

      if (data.token) localStorage.setItem('auth_token', data.token);
      const token = data.token || getAuthToken();

      await fetchProfile(token);
      await fetchUserPosition(token);
      await fetchSpins(token);
      await fetchDailyBonuses(token);
      setNeedsRegistration(false);
    } catch (err) {
      console.error(err);
      if (err.message === 'NO_INIT_DATA') {
        setError('Пожалуйста, откройте приложение через Telegram.');
      } else {
        setError(err.message || 'Ошибка подключения к серверу Django.');
      }
      setNeedsRegistration(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    authenticateUser();
  }, []);

  // Handle Tab changes
  useEffect(() => {
    const token = getAuthToken();
    if (!token || profile?.is_staff) return;

    if (activeTab === 'wheel') {
      fetchProfile(token);
      fetchWheelPrizesApi(token)
        .then(data => {
          const activePrizes = data.filter(p => p.is_active).map((p, idx) => ({
            ...p,
            color: idx % 2 === 0 ? '#FFE500' : '#141416',
            textColor: idx % 2 === 0 ? '#000000' : '#FFFFFF'
          }));
          setWheelPrizes(activePrizes);
        })
        .catch(err => console.error("Ошибка загрузки призов колеса", err));
    } else if (activeTab === 'ladder') {
      fetchGlobalLeaderboard(token);
      fetchUserPosition(token);
    } else if (activeTab === 'daily') {
      Promise.all([
        fetchProfile(token),
        fetchDailyBonuses(token)
      ]);
    }
  }, [activeTab, profile?.is_staff]);

  if (isLoading) return <div style={styles.container}><h2>Загрузка Arena...</h2></div>;

  // --- ADMIN PAGE VIEW (Shown only if is_staff is True) ---
  if (profile?.is_staff) {
    return <AdminView profile={profile} />;
  }

  // --- REGISTRATION VIEW ---
  if (needsRegistration) {
    return (
      <RegistrationView 
        authenticateUser={authenticateUser} 
        error={error} 
        setError={setError} 
      />
    );
  }

  const canSpin = profile?.can_spin ?? false;
  const canClaimBonus = profile?.can_claim_daily_bonus ?? false;

  // --- REGULAR PLAYER VIEW ---
  return (
    <div style={styles.container}>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @keyframes giftPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        @keyframes giftBreak {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-10deg) scale(1.1); }
          75% { transform: rotate(10deg) scale(1.1); }
          100% { transform: rotate(0deg) scale(0.9); }
        }
        @keyframes animatedGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulseGlow {
          0% {
            border-color: #FFE500;
            box-shadow: 0 0 10px rgba(255, 229, 0, 0.2);
          }
          50% {
            border-color: #FF007A;
            box-shadow: 0 0 22px rgba(255, 0, 122, 0.5);
          }
          100% {
            border-color: #FFE500;
            box-shadow: 0 0 10px rgba(255, 229, 0, 0.2);
          }
        }
      `}</style>

      <Toast copiedCode={copiedCode} />

      <div style={styles.mainWrapper}>
        <Header 
          profile={profile} 
          setActiveTab={setActiveTab} 
          refreshAppData={refreshAppData} 
          setShowPrizesModal={setShowPrizesModal} 
        />

        {activeTab === 'hub' && (
          <HubView 
            onProfileChange={setProfile}
            profile={profile} 
            ladderRank={ladderRank} 
            setActiveTab={setActiveTab} 
            canClaimBonus={canClaimBonus} 
          />
        )}

        {activeTab === 'wheel' && (
          <WheelView 
            profile={profile} 
            wheelPrizes={wheelPrizes} 
            setWonPrize={setWonPrize} 
            fetchProfile={fetchProfile} 
            fetchUserPosition={fetchUserPosition} 
            canSpin={canSpin} 
          />
        )}

        {activeTab === 'daily' && (
          <DailyBonusView 
            profile={profile} 
            canClaimBonus={canClaimBonus} 
            latestDailyBonus={latestDailyBonus} 
            setLatestDailyBonus={setLatestDailyBonus} 
            fetchProfile={fetchProfile} 
            copyToClipboard={copyToClipboard} 
          />
        )}

        {activeTab === 'ladder' && (
          <LeaderboardView 
            leaderboardList={leaderboardList} 
            profile={profile} 
          />
        )}

        <Navigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          refreshAppData={refreshAppData} 
        />
      </div>

      <PrizesModal 
        showPrizesModal={showPrizesModal} 
        setShowPrizesModal={setShowPrizesModal} 
        userSpins={userSpins}
      />

      <WinnerModal 
        wonPrize={wonPrize} 
        setWonPrize={setWonPrize} 
      />
    </div>
  );
}
