import React, { useState, useEffect } from 'react';
import { styles } from '../../styles/styles';

export default function RegistrationView({ authenticateUser, error, setError }) {
  const [usernameInput, setUsernameInput] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  // Clear initial login/auth error when the registration screen first loads
  useEffect(() => {
    if (setError) {
      setError('');
    }
  }, [setError]);

  // Extract 10 digits without country code (e.g. +79990000000 -> 9990000000)
  const formatPhone = (rawPhone) => {
    if (!rawPhone) return '';
    const cleaned = String(rawPhone).replace(/\D/g, '');
    return cleaned.length >= 10 ? cleaned.slice(-10) : cleaned;
  };

  useEffect(() => {
    // Attempt to automatically extract phone from Telegram WebApp user object
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (tgUser?.phone_number) {
      setPhoneNumber(formatPhone(tgUser.phone_number));
    }
  }, []);

  const handleRequestContact = () => {
    if (window.Telegram?.WebApp?.requestContact) {
      window.Telegram.WebApp.requestContact((sent, response) => {
        if (sent && response?.responseUnsafe?.contact?.phone_number) {
          setPhoneNumber(formatPhone(response.responseUnsafe.contact.phone_number));
        }
      });
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (setError) setError('');

    let finalPhone = phoneNumber;
    if (!finalPhone) {
      const tgPhone = window.Telegram?.WebApp?.initDataUnsafe?.user?.phone_number;
      if (tgPhone) {
        finalPhone = formatPhone(tgPhone);
      }
    }

    if (!finalPhone) {
      setLocalError('Не удалось определить номер телефона Telegram. Пожалуйста, предоставьте доступ к контакту.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authenticateUser({ 
        username: usernameInput.trim(), 
        phone_number: finalPhone
      });
    } catch (err) {
      setLocalError(err?.message || 'Ошибка регистрации');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only display errors that occur during active form interaction/submission
  const displayError = localError || error;

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

          {!phoneNumber && window.Telegram?.WebApp?.requestContact && (
            <button 
              type="button" 
              onClick={handleRequestContact} 
              style={{ ...styles.submitButton, marginBottom: '15px', backgroundColor: '#3182ce' }}
            >
              📱 ПОДТВЕРДИТЬ ТЕЛЕФОН TELEGRAM
            </button>
          )}

          {displayError && <p style={styles.errorText}>{displayError}</p>}

          <button type="submit" disabled={isSubmitting} style={styles.submitButton}>
            {isSubmitting ? 'ЗАГРУЗКА...' : 'ВОЙТИ В ARENA HUB 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
}