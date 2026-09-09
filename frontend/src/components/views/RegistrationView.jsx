import React, { useState } from 'react';
import { styles } from '../../styles/styles';

export default function RegistrationView({ authenticateUser, error, setError }) {
  const [usernameInput, setUsernameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phoneInput)) {
      alert('Введите ровно 10 цифр номера телефона без кода страны.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    await authenticateUser({ 
      username: usernameInput.trim(), 
      phone_number: `${phoneInput}`
    });
    setIsSubmitting(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.regWrapper}>
        <div style={styles.regHeader}>
          <div style={styles.gamepadIcon}>🎮</div>
          <h1 style={styles.regTitle}>РЕГИСТРАЦИЯ ИГРОКА</h1>
          <p style={styles.regSubtitle}>Заполните данные для доступа к Колесу Фортуны, Ежедневному Бонусу и Таблице Лидеров!</p>
        </div>

        <form onSubmit={handleRegisterSubmit} style={styles.regCard}>
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>НИКНЕЙМ</label>
            <input 
              type="text" 
              required 
              placeholder="CyberGamer_777" 
              value={usernameInput} 
              onChange={(e) => setUsernameInput(e.target.value)} 
              style={styles.textInput} 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>НОМЕР ТЕЛЕФОНА</label>
            <div style={styles.phoneBox}>
              <span style={styles.phonePrefix}>+7</span>
              <input 
                type="tel" 
                required 
                maxLength="10" 
                placeholder="(999) 000-00-00" 
                value={phoneInput} 
                onChange={(e) => setPhoneInput(e.target.value)} 
                style={styles.phoneField} 
              />
            </div>
          </div>

          {error && <p style={styles.errorText}>{error}</p>}

          <button type="submit" disabled={isSubmitting} style={styles.submitButton}>
            {isSubmitting ? 'ЗАГРУЗКА...' : 'ВОЙТИ В ARENA HUB 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
}
