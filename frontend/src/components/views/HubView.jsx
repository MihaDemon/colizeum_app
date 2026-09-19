import React, { useEffect, useRef, useState } from 'react';
import { updateNicknameApi } from '../../services/api';
import { styles } from '../../styles/styles';
import WheelLogo from '../WheelLogo';
import DailyBonusLogo from '../DailyBonusLogo';
import LadderLogo from '../LadderLogo';
import HubLogo from '../HubLogo';

export default function HubView({ profile, ladderRank, setActiveTab, canClaimBonus, onProfileChange }) {
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const nicknameInput = useRef(null);
  const saveInProgress = useRef(false);

  useEffect(() => {
    if (!editing) return;
    const input = nicknameInput.current;
    input?.focus();
    input?.setSelectionRange(input.value.length, input.value.length);
    const blurOutside = (event) => {
      if (event.target !== input) input?.blur();
    };
    // Some mobile keyboards close without blurring the focused input.
    const viewport = window.visualViewport;
    let smallestHeight = viewport?.height;
    const initialWidth = viewport?.width;
    const keyboardResize = () => {
      if (Math.abs(viewport.width - initialWidth) > 40) return;
      smallestHeight = Math.min(smallestHeight, viewport.height);
      if (viewport.height - smallestHeight > 120) input?.blur();
    };
    document.addEventListener('pointerdown', blurOutside);
    viewport?.addEventListener('resize', keyboardResize);
    return () => {
      document.removeEventListener('pointerdown', blurOutside);
      viewport?.removeEventListener('resize', keyboardResize);
    };
  }, [editing]);

  const saveNickname = async () => {
    if (saveInProgress.current) return;
    const value = nickname.trim();
    if (!value) { setError('Введите никнейм.'); return; }
    if (value === profile?.username) { setEditing(false); setError(''); return; }
    saveInProgress.current = true;
    setSaving(true);
    setError('');
    try {
      const updated = await updateNicknameApi(value);
      onProfileChange(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      saveInProgress.current = false;
      setSaving(false);
    }
  };
  return (
    <>
      <div style={styles.userCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
          <div style={styles.avatarBox}><HubLogo size={30} /></div>
          <div style={{ minWidth: 0, flex: 1 }}>
            {editing ? (
              <form style={{ margin: 0 }} onSubmit={(event) => { event.preventDefault(); nicknameInput.current?.blur(); }}>
                <input ref={nicknameInput} aria-label="Никнейм" maxLength={30}
                  value={nickname} readOnly={saving} autoComplete="nickname" enterKeyHint="done"
                  onChange={(event) => { setNickname(event.target.value); setError(''); }}
                  onBlur={saveNickname}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                      event.preventDefault(); event.currentTarget.blur();
                    }
                  }}
                  aria-invalid={Boolean(error)} aria-describedby={error ? 'nickname-error' : undefined}
                  style={{ width: '100%', boxSizing: 'border-box', minWidth: 0,
                    fontFamily: 'inherit', fontSize: '16px', lineHeight: '24px',
                    fontWeight: '900', color: '#FFF', WebkitTextFillColor: '#FFF',
                    background: 'rgba(0, 0, 0, 0.12)', border: 0, outline: 'none',
                    boxShadow: 'none', appearance: 'none', WebkitAppearance: 'none',
                    caretColor: '#FFE500', borderRadius: '8px', padding: '8px 6px' }} />
              </form>
            ) : (
            <button type="button" aria-label="Изменить никнейм" onClick={() => {
              setNickname(profile?.username || ''); setError(''); setEditing(true);
            }} style={{ fontFamily: 'inherit', fontSize: '16px', lineHeight: '24px', fontWeight: '900', color: '#FFF', margin: 0, background: 'none', border: 0, padding: '8px 6px', textAlign: 'left', cursor: 'pointer', overflowWrap: 'anywhere' }}>
              {profile?.username || profile?.app_username || 'Игрок'}
              <span aria-hidden="true" style={{ color: '#FFE500', marginLeft: 6 }}>✎</span>
            </button>
            )}
            {saving && <span role="status" style={{ fontSize: '10px', color: '#AAA' }}>Сохранение…</span>}
            {error && <div id="nickname-error" role="alert" style={{ fontSize: '11px', color: '#FF8080' }}>{error}</div>}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
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
