import React, { useEffect, useRef, useState } from 'react';
import { styles } from '../../styles/styles';
import { getAuthToken } from '../../utils/helpers';
import { spinWheelApi } from '../../services/api';

export default function WheelView({ profile, wheelPrizes, setWonPrize, fetchProfile, fetchPromocodes, fetchUserPosition, canSpin }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelStatusText, setWheelStatusText] = useState('SPIN THE WHEEL & WIN BONUSES!');

  const canvasRef = useRef(null);
  const angleRef = useRef(0);
  const velocityRef = useRef(0);
  const animFrameRef = useRef(null);
  const lastPegRef = useRef(-1);

  // Canvas Drawing & Physics Loop
  useEffect(() => {
    if (profile?.is_staff || wheelPrizes.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const numSectors = wheelPrizes.length;
    const arcAngle = (Math.PI * 2) / numSectors;

    const drawStand = (cx, cy, radius) => {
      const baseTopY = cy + radius + 22;
      const baseBottomY = baseTopY + 28;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy);
      ctx.lineTo(cx + 30, cy);
      ctx.lineTo(cx + 70, baseTopY);
      ctx.lineTo(cx - 70, baseTopY);
      ctx.closePath();
      ctx.fillStyle = "#141418";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#FFE500";
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 85, baseTopY);
      ctx.lineTo(cx + 85, baseTopY);
      ctx.lineTo(cx + 95, baseBottomY);
      ctx.lineTo(cx - 95, baseBottomY);
      ctx.closePath();
      ctx.fillStyle = "#09090B";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#2A2A32";
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 14, cy - radius - 28);
      ctx.lineTo(cx + 14, cy - radius - 28);
      ctx.lineTo(cx + 10, cy - radius - 8);
      ctx.lineTo(cx - 10, cy - radius - 8);
      ctx.closePath();
      ctx.fillStyle = "#141418";
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    const drawPointer = (px, py) => {
      ctx.save();
      ctx.translate(px, py);
      ctx.beginPath();
      ctx.moveTo(-10, -14);
      ctx.lineTo(10, -14);
      ctx.lineTo(0, 12);
      ctx.closePath();
      ctx.fillStyle = "#0E0E10";
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#FFE500";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, -8, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#FFE500";
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2 - 10;
      const radius = 118;

      ctx.clearRect(0, 0, width, height);
      drawStand(cx, cy, radius);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angleRef.current);

      // Outer Rim
      ctx.beginPath();
      ctx.arc(0, 0, radius + 14, 0, Math.PI * 2);
      ctx.fillStyle = "#0E0E10";
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = "#FFE500";
      ctx.stroke();

      // Outer Rim Text
      const totalRimTexts = 12;
      for (let r = 0; r < totalRimTexts; r++) {
        ctx.save();
        ctx.rotate(r * ((Math.PI * 2) / totalRimTexts));
        ctx.fillStyle = "#FFE500";
        ctx.fillRect(-8, -radius - 13, 16, 3);
        ctx.fillStyle = "#FFE500";
        ctx.font = "800 7px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("COLIZEUM", 0, -radius - 5);
        ctx.restore();
      }

      // Sectors
      for (let i = 0; i < numSectors; i++) {
        const sector = wheelPrizes[i];
        const startRad = i * arcAngle;
        const endRad = startRad + arcAngle;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startRad, endRad);
        ctx.closePath();
        ctx.fillStyle = sector.color;
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "#000000";
        ctx.stroke();

        ctx.save();
        ctx.rotate(startRad + arcAngle / 2);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = sector.textColor;

        const textDist = radius * 0.65;
        const prizeLabel = sector.label || sector.name || '';
        const prizeVal = sector.val || sector.value || '';

        if (prizeLabel) {
          ctx.font = "800 9px sans-serif";
          ctx.fillText(prizeLabel.toUpperCase(), textDist, -8);
        }

        ctx.font = "900 15px sans-serif";
        const valY = prizeLabel ? 7 : 0;
        ctx.fillText(String(prizeVal).toUpperCase(), textDist, valY);

        ctx.restore();
      }

      // Pegs
      for (let i = 0; i < numSectors; i++) {
        const pegRad = i * arcAngle;
        const px = Math.cos(pegRad) * (radius + 1);
        const py = Math.sin(pegRad) * (radius + 1);

        ctx.beginPath();
        ctx.arc(px, py, 2.8, 0, Math.PI * 2);
        ctx.fillStyle = "#FFE500";
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#000000";
        ctx.stroke();
      }

      // Center Hub Cap
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fillStyle = "#0E0E10";
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#FFE500";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#FFE500";
      ctx.fill();

      ctx.restore();
      drawPointer(cx, cy - radius - 12);
    };

    const updatePhysics = () => {
      if (velocityRef.current > 0) {
        angleRef.current += velocityRef.current;
        velocityRef.current *= 0.986;

        const normalizedAngle = (Math.PI * 2 - (angleRef.current % (Math.PI * 2))) % (Math.PI * 2);
        const currentPeg = Math.floor((normalizedAngle + Math.PI / 2) / arcAngle) % numSectors;

        if (currentPeg !== lastPegRef.current) {
          lastPegRef.current = currentPeg;
          const tg = window.Telegram?.WebApp;
          if (tg?.HapticFeedback) {
            tg.HapticFeedback.selectionChanged();
          }
        }

        if (velocityRef.current < 0.0015) {
          velocityRef.current = 0;
        }
      }

      render();
      animFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animFrameRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [wheelPrizes, profile?.is_staff]);

  const spinWheel = async () => {
    if (isSpinning || wheelPrizes.length === 0 || !profile?.can_spin) return;
    setIsSpinning(true);
    setWheelStatusText('КРУТИМ КОЛЕСО...');

    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('heavy');

    try {
      const token = getAuthToken();
      const spinData = await spinWheelApi(token);

      const winningIndex = wheelPrizes.findIndex(p => p.id === spinData.prize);
      const targetIndex = winningIndex !== -1 ? winningIndex : 0;

      const arcAngle = (Math.PI * 2) / wheelPrizes.length;
      const targetSectorAngle = targetIndex * arcAngle + arcAngle / 2;
      const targetAngle = (8 * Math.PI * 2) + (1.5 * Math.PI - targetSectorAngle);
      
      const friction = 0.986;
      velocityRef.current = (targetAngle - (angleRef.current % (Math.PI * 2))) * (1 - friction);

      const checkStop = setInterval(() => {
        if (velocityRef.current === 0) {
          clearInterval(checkStop);
          setIsSpinning(false);

          if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');

          const prizeObj = wheelPrizes[targetIndex];
          const fullLabel = prizeObj.label ? `${prizeObj.label} ${prizeObj.val || ''}` : prizeObj.val || 'БОНУС';
          
          setWheelStatusText(`ВЫ ВЫИГРАЛИ: ${fullLabel.toUpperCase()}! 🎉`);
          setWonPrize({ title: fullLabel, code: spinData.promo_code });
          fetchProfile(token);
          fetchPromocodes(token);
          fetchUserPosition(token);
        }
      }, 100);

    } catch (err) {
      alert(err.message);
      setIsSpinning(false);
      setWheelStatusText('SPIN THE WHEEL & WIN BONUSES!');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0' }}>
      <div style={{ position: 'relative', width: '340px', height: '360px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <canvas ref={canvasRef} width="350" height="380" style={{ width: '100%', height: '100%' }}></canvas>
      </div>

      <p style={{ color: isSpinning ? '#FFE500' : '#888', fontSize: '11px', fontWeight: '900', letterSpacing: '1px', textAlign: 'center', margin: '10px 0 12px 0', textTransform: 'uppercase' }}>
        {wheelStatusText}
      </p>

      <button 
        onClick={spinWheel} 
        disabled={isSpinning || wheelPrizes.length === 0 || !canSpin} 
        style={{ 
          ...styles.submitButton, 
          width: '100%', 
          backgroundColor: canSpin ? '#FFE500' : '#2A2A32',
          color: canSpin ? '#0E0E10' : '#777',
          cursor: canSpin ? 'pointer' : 'not-allowed',
          boxShadow: canSpin ? '0 0 15px rgba(255, 229, 0, 0.3)' : 'none'
        }}
      >
        {isSpinning ? 'КРУТИМ КОЛЕСО...' : (canSpin ? 'КРУТИТЬ КОЛЕСО' : 'НЕДОСТУПНО')}
      </button>
    </div>
  );
}
