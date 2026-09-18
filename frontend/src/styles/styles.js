const surface = '#15161B';
const surfaceRaised = '#1B1C22';
const page = '#090A0D';
const border = 'rgba(255, 255, 255, 0.09)';
const muted = '#8D8F99';
const yellow = '#FFE500';

export const styles = {
  container: {
    background: `radial-gradient(circle at 50% -10%, rgba(255, 229, 0, 0.08), transparent 38%), ${page}`,
    color: '#FFFFFF',
    minHeight: '100dvh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
    padding: 'max(18px, env(safe-area-inset-top)) 12px max(16px, env(safe-area-inset-bottom))',
    boxSizing: 'border-box',
    overflowX: 'hidden'
  },
  mainWrapper: {
    width: '100%',
    maxWidth: '420px',
    minHeight: 'calc(100dvh - 36px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    boxSizing: 'border-box'
  },

  // Header Styles
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 2px 14px',
    borderBottom: `1px solid ${border}`,
    marginBottom: '2px'
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', minWidth: 0 },
  yellowBar: { width: '5px', height: '30px', backgroundColor: yellow, borderRadius: '2px', transform: 'skewX(-14deg)', flexShrink: 0 },
  headerBrand: { fontSize: '17px', fontWeight: '900', color: '#FFFFFF', margin: 0, lineHeight: '18px', letterSpacing: '0.8px' },
  headerSub: { fontSize: '8px', fontWeight: '800', color: yellow, letterSpacing: '1.2px', textTransform: 'uppercase', margin: '4px 0 0 0' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 },
  pointsBadge: { backgroundColor: surface, border: `1px solid ${border}`, padding: '9px 12px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '5px', boxShadow: '0 8px 20px rgba(0,0,0,0.16)' },
  ptsLabel: { fontSize: '9px', color: muted, fontWeight: '800', letterSpacing: '0.6px' },
  ptsValue: { fontSize: '13px', fontWeight: '900', color: yellow },
  winsButton: { backgroundColor: surface, border: `1px solid ${border}`, borderRadius: '16px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '17px', boxShadow: '0 8px 20px rgba(0,0,0,0.16)', WebkitTapHighlightColor: 'transparent' },

  // Registration View Styles
  regWrapper: { width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', margin: 'auto 0' },
  regHeader: { textAlign: 'center', padding: '0 10px' },
  gamepadIcon: { width: '64px', height: '64px', backgroundColor: yellow, color: page, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px auto', boxShadow: '0 12px 35px rgba(255, 229, 0, 0.22)' },
  regTitle: { fontSize: '22px', fontWeight: '900', color: '#FFFFFF', margin: '0 0 8px 0', letterSpacing: '0.2px' },
  regSubtitle: { fontSize: '12px', color: muted, lineHeight: '1.5', margin: 0 },
  regCard: { backgroundColor: surface, border: `1px solid ${border}`, borderRadius: '24px', padding: '20px', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 18px 45px rgba(0,0,0,0.28)' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '7px' },
  inputLabel: { fontSize: '10px', fontWeight: '800', color: muted, letterSpacing: '0.7px' },
  textInput: { backgroundColor: page, border: `1px solid ${border}`, borderRadius: '14px', padding: '14px', color: '#FFFFFF', fontSize: '14px', outline: 'none', fontWeight: '600' },
  selectInput: { backgroundColor: page, border: `1px solid ${border}`, borderRadius: '14px', padding: '14px', color: '#FFFFFF', fontSize: '12px', outline: 'none', fontWeight: '600', cursor: 'pointer' },
  phoneBox: { display: 'flex', alignItems: 'center', backgroundColor: page, border: `1px solid ${border}`, borderRadius: '14px', overflow: 'hidden' },
  phonePrefix: { padding: '14px 0 14px 16px', color: muted, fontSize: '14px', fontWeight: '700' },
  phoneField: { backgroundColor: 'transparent', border: 'none', padding: '14px', color: '#FFFFFF', fontSize: '14px', outline: 'none', width: '100%', fontWeight: '600' },
  submitButton: { backgroundColor: yellow, color: page, border: 'none', borderRadius: '16px', minHeight: '52px', padding: '14px 16px', fontWeight: '900', fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase', width: '100%', boxShadow: '0 12px 24px rgba(255, 229, 0, 0.18)', letterSpacing: '0.7px', WebkitTapHighlightColor: 'transparent' },

  // Admin Card Styles
  adminCard: { backgroundColor: surface, border: `1px solid ${border}`, borderRadius: '18px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 12px 30px rgba(0,0,0,0.16)' },
  adminCardHeader: { display: 'flex', alignItems: 'center', gap: '8px' },
  adminCardTitle: { fontSize: '12px', fontWeight: '900', color: yellow, margin: 0 },
  adminCardSub: { fontSize: '9px', color: muted, margin: '2px 0 0 0' },
  adminForm: { display: 'flex', flexDirection: 'column', gap: '8px' },

  // Hub View Styles
  userCard: { background: `linear-gradient(145deg, ${surfaceRaised}, ${surface})`, border: `1px solid ${border}`, borderRadius: '22px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 14px 30px rgba(0,0,0,0.18)' },
  avatarBox: { width: '46px', height: '46px', backgroundColor: yellow, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '21px', boxShadow: '0 8px 18px rgba(255,229,0,0.15)' },
  menuCard: { backgroundColor: surface, border: `1px solid ${border}`, borderRadius: '20px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 10px 26px rgba(0,0,0,0.14)', WebkitTapHighlightColor: 'transparent' },
  wheelMenuCard: { background: `linear-gradient(145deg, ${surfaceRaised}, ${surface})`, border: `1.5px solid ${yellow}`, borderRadius: '20px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: '0 0 24px rgba(255, 229, 0, 0.13)', WebkitTapHighlightColor: 'transparent' },
  statsFooter: { backgroundColor: surface, border: `1px solid ${border}`, borderRadius: '20px', padding: '15px 12px', display: 'flex', justifyContent: 'space-around', boxShadow: '0 10px 26px rgba(0,0,0,0.14)' },
  leaderboardItem: { borderRadius: '18px', padding: '15px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.12)' },
  navBar: { backgroundColor: 'rgba(27, 28, 34, 0.94)', border: `1px solid ${border}`, borderRadius: '22px', padding: '5px', display: 'flex', justifyContent: 'space-around', gap: '3px', marginTop: 'auto', position: 'sticky', bottom: '10px', zIndex: 20, backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', boxShadow: '0 12px 30px rgba(0,0,0,0.28)' },
  navButton: { background: 'transparent', border: 'none', borderRadius: '16px', flex: 1, minWidth: 0, minHeight: '40px', padding: '7px 3px', color: muted, fontWeight: '900', fontSize: '9px', cursor: 'pointer', letterSpacing: '0.4px', whiteSpace: 'nowrap', WebkitTapHighlightColor: 'transparent' },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(3, 4, 6, 0.78)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '20px' },
  modalCard: { background: `linear-gradient(145deg, ${surfaceRaised}, ${surface})`, border: `1px solid rgba(255, 229, 0, 0.65)`, borderRadius: '24px', padding: '22px', width: '100%', maxWidth: '320px', textAlign: 'center', boxShadow: '0 24px 70px rgba(0,0,0,0.48)' },
  promoBox: { backgroundColor: page, border: `1px dashed ${yellow}`, borderRadius: '12px', padding: '10px', margin: '10px 0' },
  winHistoryItem: { backgroundColor: page, border: `1px solid ${border}`, borderRadius: '14px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' },
  toastNotification: { position: 'fixed', top: 'max(20px, env(safe-area-inset-top))', left: '50%', transform: 'translateX(-50%)', backgroundColor: yellow, color: page, padding: '10px 18px', borderRadius: '20px', fontWeight: '900', fontSize: '12px', zIndex: 1000, boxShadow: '0 8px 24px rgba(255, 229, 0, 0.25)' },
  errorText: { color: '#FF6B6B', fontSize: '12px', textAlign: 'center', margin: 0 },
  successBox: { backgroundColor: 'rgba(76, 175, 80, 0.12)', border: '1px solid rgba(76, 175, 80, 0.7)', color: '#81C784', padding: '9px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' },
  errorBox: { backgroundColor: 'rgba(244, 67, 54, 0.12)', border: '1px solid rgba(244, 67, 54, 0.7)', color: '#E57373', padding: '9px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }
};
