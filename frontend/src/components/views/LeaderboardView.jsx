import React from 'react';
import { styles } from '../../styles/styles';

export default function LeaderboardView({ leaderboardList, profile }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <h3 style={{ color: '#FFE500', fontSize: '18px', fontWeight: '900', margin: 0 }}>MONTHLY LADDER 🏆</h3>
        <p style={{ color: '#888', fontSize: '11px', margin: '4px 0 0 0' }}>Топ игроков месяца COLIZEUM</p>
      </div>

      <div className="no-scrollbar" style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {leaderboardList.length === 0 ? (
          <p style={{ color: '#666', fontSize: '12px', textAlign: 'center', margin: '20px 0' }}>Загрузка таблицы лидеров...</p>
        ) : (
          leaderboardList.map((player) => {
            const isCurrentUser = player.username === profile?.username;
            return (
              <div 
                key={`${player.username}-${player.position}`}
                style={{ 
                  ...styles.leaderboardItem,
                  border: isCurrentUser ? '1px solid #FFE500' : '1px solid #2A2A32',
                  backgroundColor: isCurrentUser ? '#18181C' : '#0E0E10'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ 
                    fontWeight: '900', 
                    fontSize: '14px', 
                    color: player.position === 1 ? '#FFE500' : (player.position === 2 ? '#C0C0C0' : (player.position === 3 ? '#CD7F32' : '#888')),
                    width: '24px',
                    textAlign: 'center'
                  }}>
                    #{player.position}
                  </span>
                  <div>
                    <p style={{ fontWeight: 'bold', fontSize: '13px', color: '#FFF', margin: 0 }}>
                      {player.username} {isCurrentUser && ' (Вы)'}
                    </p>
                    <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>Стрик: {player.daily_streak} дн.</p>
                  </div>
                </div>
                <span style={{ fontWeight: '900', color: '#FFE500', fontSize: '14px' }}>
                  {player.monthly_points} PTS
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
