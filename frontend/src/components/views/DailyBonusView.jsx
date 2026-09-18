import React, { useState } from 'react';
import { styles } from '../../styles/styles';
import { getAuthToken, formatDate } from '../../utils/helpers';
import { claimDailyBonusApi } from '../../services/api';
import DailyBonusLogo from '../DailyBonusLogo';
import PromoCodeLogo from '../PromoCodeLogo';

export default function DailyBonusView({ profile, canClaimBonus, latestDailyBonus, setLatestDailyBonus, fetchProfile, copyToClipboard }) {
  const [isOpeningGift, setIsOpeningGift] = useState(false);
  const isRedeemed = latestDailyBonus?.is_redeemed ?? false;

  const claimDailyBonus = async () => {
    if (isOpeningGift || !profile?.can_claim_daily_bonus) return;
    setIsOpeningGift(true);

    try {
      const token = getAuthToken();
      const data = await claimDailyBonusApi(token);

      setTimeout(() => {
        setLatestDailyBonus(data);
        setIsOpeningGift(false);
        fetchProfile(token);
      }, 600);

    } catch (err) {
      alert(err.message);
      setIsOpeningGift(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <DailyBonusLogo size={23} />
        <h3 style={{ color: '#FFE500', fontSize: '18px', fontWeight: '900', margin: 0 }}>DAILY BONUS</h3>
      </div>
      <p style={{ color: '#888', fontSize: '11px', textAlign: 'center', marginBottom: '16px' }}>
        {canClaimBonus ? 'Нажми на подарок, чтобы забрать ежедневную награду!' : 'Ежедневный подарок уже получен'}
      </p>

      <div style={{ width: '280px', minHeight: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        
        {canClaimBonus ? (
          /* Animated Gift Button */
          <button
            onClick={claimDailyBonus}
            disabled={isOpeningGift}
            style={{
              width: '260px',
              height: '260px',
              backgroundColor: '#18181C',
              border: '3px solid #FFE500',
              borderRadius: '30px',
              fontSize: '110px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 0 25px rgba(255, 229, 0, 0.3)',
              animation: isOpeningGift ? 'giftBreak 0.6s ease-in-out infinite' : 'giftPulse 2s infinite ease-in-out',
              transition: 'all 1s'
            }}
          >
            <DailyBonusLogo size={118} />
          </button>
        ) : (
          /* Promocode Details Box */
          <div style={{
            width: '260px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            {/* Prize Title */}
            <div style={{
              minHeight: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              margin: '8px 0'
            }}>
              <h4 style={{ 
                fontSize: '22px', 
                fontWeight: '900', 
                margin: 0, 
                textTransform: 'uppercase',
                textAlign: 'center',
                background: 'linear-gradient(270deg, #FFE500, #FF007A, #00E5FF, #FFE500)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'animatedGradient 4s ease infinite'
              }}>
                {latestDailyBonus?.prize || 'ЕЖЕДНЕВНЫЙ БОНУС'}
              </h4>
            </div>

            {/* Promocode Field with Conditional Copying */}
            <div 
              onClick={() => {
                if (!isRedeemed) {
                  copyToClipboard(latestDailyBonus?.promo_code || 'DAILY-BONUS');
                }
              }}
              title={isRedeemed ? "Промокод использован" : "Нажмите, чтобы скопировать"}
              style={{ 
                backgroundColor: '#0E0E10', 
                border: `1px dashed ${isRedeemed ? '#555555' : '#FFE500'}`, 
                padding: '12px 14px', 
                borderRadius: '12px', 
                width: '100%', 
                marginBottom: '14px',
                cursor: isRedeemed ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <PromoCodeLogo size={19} />
              <span style={{ 
                fontFamily: 'monospace', 
                fontWeight: '900', 
                color: isRedeemed ? '#777777' : '#FFE500', 
                fontSize: '15px',
                textDecoration: isRedeemed ? 'line-through' : 'none'
              }}>
                {latestDailyBonus?.promo_code || 'DAILY-BONUS'}
              </span>
            </div>

            {/* Limit rules or Used Status display */}
            <div style={{ fontSize: '13px', color: '#AAA', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {isRedeemed ? (
                <p style={{ margin: 0, color: '#888', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Промокод использован
                </p>
              ) : (
                <>
                  {latestDailyBonus && !latestDailyBonus.can_redeem && (
                    <p style={{ margin: 0, color: '#FF9800', fontWeight: 'bold' }}>
                      ⏳ Доступен с: {formatDate(latestDailyBonus.use_after)}
                    </p>
                  )}
                  {latestDailyBonus && (
                    <p style={{ margin: 0, color: '#888' }}>
                      ⌛ Срок действия до: {formatDate(latestDailyBonus.use_until)}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
