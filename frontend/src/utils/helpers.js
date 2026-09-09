export const getInitData = () => {
  const tg = window.Telegram?.WebApp;
  tg?.ready();
  tg?.expand();
  return tg?.initData;
};

export const getAuthToken = () => localStorage.getItem('auth_token') || '';

export const copyToClipboard = (text, setCopiedCode) => {
  if (!text) return;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
  const tg = window.Telegram?.WebApp;
  if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');

  setCopiedCode(text);
  setTimeout(() => setCopiedCode(''), 2500);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};
