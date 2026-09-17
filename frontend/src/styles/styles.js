export const styles = {
  container: { backgroundColor: '#0E0E10', color: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, sans-serif', padding: '12px' },
  mainWrapper: { width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '10px' },
  
  // Header Styles
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #2A2A32', marginBottom: '4px' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' },
  yellowBar: { width: '6px', height: '18px', backgroundColor: '#FFE500', borderRadius: '1px', transform: 'skewX(-14deg)' },
  headerBrand: { fontSize: '16px', fontWeight: '900', color: '#FFFFFF', margin: 0, lineHeight: '16px', letterSpacing: '0.5px' },
  headerSub: { fontSize: '8px', fontWeight: '700', color: '#FFE500', letterSpacing: '1px', textTransform: 'uppercase', margin: '2px 0 0 0' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  pointsBadge: { backgroundColor: '#18181C', border: '1px solid #2A2A32', padding: '6px 14px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '4px' },
  ptsLabel: { fontSize: '10px', color: '#888888', fontWeight: 'bold' },
  ptsValue: { fontSize: '12px', fontWeight: '900', color: '#FFE500' },
  winsButton: { backgroundColor: '#18181C', border: '1px solid #2A2A32', borderRadius: '16px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px' },

  // Registration View Styles
  regWrapper: { width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' },
  regHeader: { textAlign: 'center', padding: '0 10px' },
  gamepadIcon: { width: '64px', height: '64px', backgroundColor: '#FFE500', color: '#0E0E10', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px auto', boxShadow: '0 0 25px rgba(255, 229, 0, 0.4)' },
  regTitle: { fontSize: '20px', fontWeight: '900', color: '#FFFFFF', margin: '0 0 8px 0', letterSpacing: '0.5px' },
  regSubtitle: { fontSize: '11px', color: '#999999', lineHeight: '1.4', margin: 0 },
  regCard: { backgroundColor: '#18181C', border: '1px solid #2A2A32', borderRadius: '24px', padding: '20px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  inputLabel: { fontSize: '10px', fontWeight: '800', color: '#888888', letterSpacing: '0.5px' },
  textInput: { backgroundColor: '#0E0E10', border: '1px solid #2A2A32', borderRadius: '14px', padding: '14px', color: '#FFFFFF', fontSize: '14px', outline: 'none', fontWeight: '600' },
  selectInput: { backgroundColor: '#0E0E10', border: '1px solid #2A2A32', borderRadius: '14px', padding: '14px', color: '#FFFFFF', fontSize: '12px', outline: 'none', fontWeight: '600', cursor: 'pointer' },
  phoneBox: { display: 'flex', alignItems: 'center', backgroundColor: '#0E0E10', border: '1px solid #2A2A32', borderRadius: '14px', overflow: 'hidden' },
  phonePrefix: { padding: '14px 0 14px 16px', color: '#888888', fontSize: '14px', fontWeight: '700' },
  phoneField: { backgroundColor: 'transparent', border: 'none', padding: '14px', color: '#FFFFFF', fontSize: '14px', outline: 'none', width: '100%', fontWeight: '600' },
  submitButton: { backgroundColor: '#FFE500', color: '#0E0E10', border: 'none', borderRadius: '14px', padding: '14px', fontWeight: '900', fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase', width: '100%', boxShadow: '0 0 20px rgba(255, 229, 0, 0.3)', letterSpacing: '0.5px' },

  // Admin Card Styles
  adminCard: { backgroundColor: '#18181C', border: '1px solid #2A2A32', borderRadius: '16px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' },
  adminCardHeader: { display: 'flex', alignItems: 'center', gap: '8px' },
  adminCardTitle: { fontSize: '12px', fontWeight: '900', color: '#FFE500', margin: 0 },
  adminCardSub: { fontSize: '8px', color: '#888888', margin: '2px 0 0 0' },
  adminForm: { display: 'flex', flexDirection: 'column', gap: '8px' },

  // Hub View Styles
  userCard: { backgroundColor: '#18181C', border: '1px solid #2A2A32', borderRadius: '20px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  avatarBox: { width: '42px', height: '42px', backgroundColor: '#FFE500', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
  menuCard: { backgroundColor: '#18181C', border: '1px solid #2A2A32', borderRadius: '20px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' },
  wheelMenuCard: { backgroundColor: '#18181C', border: '2px solid #FFE500', borderRadius: '20px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 0 15px rgba(255, 229, 0, 0.25)' },
  statsFooter: { backgroundColor: '#141416', border: '1px solid #2A2A32', borderRadius: '20px', padding: '12px', display: 'flex', justifyContent: 'space-around' },
  leaderboardItem: { borderRadius: '14px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navBar: { backgroundColor: '#18181C', border: '1px solid #2A2A32', borderRadius: '16px', padding: '10px', display: 'flex', justifyContent: 'space-around', marginTop: '6px' },
  navButton: { background: 'none', border: 'none', fontWeight: '900', fontSize: '10px', cursor: 'pointer', letterSpacing: '0.5px' },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '20px' },
  modalCard: { backgroundColor: '#18181C', border: '2px solid #FFE500', borderRadius: '20px', padding: '20px', width: '100%', maxWidth: '300px', textAlign: 'center' },
  bonusAmountBox: { backgroundColor: '#0E0E10', border: '1px solid #FFE500', borderRadius: '10px', padding: '14px', margin: '10px 0' },
  promoBox: { backgroundColor: '#0E0E10', border: '1px dashed #FFE500', borderRadius: '10px', padding: '10px', margin: '10px 0' },
  winHistoryItem: { backgroundColor: '#0E0E10', border: '1px solid #2A2A32', borderRadius: '10px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' },
  toastNotification: { position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#FFE500', color: '#0E0E10', padding: '10px 18px', borderRadius: '20px', fontWeight: '900', fontSize: '12px', zIndex: 1000, boxShadow: '0 4px 15px rgba(255, 229, 0, 0.4)' },
  errorText: { color: '#F44336', fontSize: '12px', textAlign: 'center', margin: 0 },
  successBox: { backgroundColor: 'rgba(76, 175, 80, 0.15)', border: '1px solid #4CAF50', color: '#81C784', padding: '8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' },
  errorBox: { backgroundColor: 'rgba(244, 67, 54, 0.15)', border: '1px solid #F44336', color: '#E57373', padding: '8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }
};
