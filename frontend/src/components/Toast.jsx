import React from 'react';
import { styles } from '../styles/styles';

export default function Toast({ copiedCode }) {
  if (!copiedCode) return null;
  return (
    <div style={styles.toastNotification}>
      📋 Скопировано: <strong>{copiedCode}</strong>
    </div>
  );
}
