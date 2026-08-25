import React, { useEffect, useRef } from 'react';

/**
 * MedicalAuthBackground - Sacred Healing Twilight & Cyan Medical Portal
 * Không chói lóa, rõ nét công trình bệnh viện, hài hòa trang trọng, tôn vinh sứ mệnh y khoa cứu người.
 */
const MedicalAuthBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // 1. Floating Healing Light Nano Particles (Bụi ánh sáng cứu sinh)
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2.2 + 0.8,
      speedY: -(Math.random() * 0.4 + 0.12),
      speedX: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.6 + 0.2,
      pulseSpeed: Math.random() * 0.025 + 0.015,
      pulseOffset: Math.random() * Math.PI * 2,
      color: ['#38BDF8', '#34D399', '#10B981', '#60A5FA', '#FDE047', '#FFFFFF'][Math.floor(Math.random() * 6)]
    }));

    // 2. Floating Translucent Medical Crosses (Biểu tượng y tế chữa lành)
    const crosses = Array.from({ length: 9 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 11 + 7,
      speedY: -(Math.random() * 0.25 + 0.08),
      speedX: (Math.random() - 0.5) * 0.15,
      alpha: Math.random() * 0.25 + 0.1,
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.008,
      color: ['#38BDF8', '#34D399', '#60A5FA'][Math.floor(Math.random() * 3)]
    }));

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.015;

      // A. Realtime Vitality ECG Heartbeat Wave (Sóng điện tâm đồ cứu sinh sống động)
      const ecgY = canvas.height * 0.82;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.55)';
      ctx.lineWidth = 2.0;
      ctx.shadowBlur = 14;
      ctx.shadowColor = '#34D399';

      for (let x = 0; x < canvas.width; x += 3) {
        const normX = (x + time * 105) % canvas.width;
        let yOffset = 0;
        const cycle = normX % 380;
        if (cycle > 120 && cycle < 140) {
          yOffset = Math.sin((cycle - 120) / 20 * Math.PI) * -12;
        } else if (cycle >= 150 && cycle < 158) {
          yOffset = ((cycle - 150) / 8) * 9;
        } else if (cycle >= 158 && cycle < 172) {
          yOffset = Math.sin((cycle - 158) / 14 * Math.PI) * -62;
        } else if (cycle >= 172 && cycle < 182) {
          yOffset = ((cycle - 172) / 10) * 14;
        } else if (cycle >= 210 && cycle < 245) {
          yOffset = Math.sin((cycle - 210) / 35 * Math.PI) * -20;
        }
        if (x === 0) ctx.moveTo(x, ecgY + yOffset);
        else ctx.lineTo(x, ecgY + yOffset);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // B. Floating Healing Nano Particles
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        const curAlpha = p.alpha * (0.65 + 0.35 * Math.sin(time * 2.8 + p.pulseOffset));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, curAlpha));
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });

      // C. Floating Translucent Medical Crosses (+)
      crosses.forEach((c) => {
        c.y += c.speedY;
        c.x += c.speedX;
        c.rotation += c.rotSpeed;

        if (c.y < -20) {
          c.y = canvas.height + 20;
          c.x = Math.random() * canvas.width;
        }
        if (c.x < -20) c.x = canvas.width + 20;
        if (c.x > canvas.width + 20) c.x = -20;

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation);
        ctx.fillStyle = c.color;
        ctx.globalAlpha = c.alpha;

        const w = c.size;
        const thick = w * 0.32;
        ctx.fillRect(-w / 2, -thick / 2, w, thick);
        ctx.fillRect(-thick / 2, -w / 2, thick, w);

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes healingAuroraBreathe {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.55; }
          50% { transform: scale(1.15) translate(20px, -15px); opacity: 0.85; }
        }
      `}</style>

      {/* 1. Deep Majestic Sapphire Twilight Foundation (Không chói, sâu sắc và tôn nghiêm) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #051329 0%, #0A2246 32%, #0E2E5C 65%, #081B38 100%)',
          zIndex: 0,
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      />

      {/* 2. Sacred Healing Auroras (Cyan Ngọc Lục Bảo & Sapphire Ánh Dương) */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '5%',
          width: '750px',
          height: '750px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.32) 0%, rgba(30, 58, 138, 0.2) 45%, transparent 70%)',
          filter: 'blur(90px)',
          zIndex: 1,
          animation: 'healingAuroraBreathe 10s ease-in-out infinite',
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      />

      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '5%',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.28) 0%, rgba(20, 184, 166, 0.18) 45%, transparent 70%)',
          filter: 'blur(90px)',
          zIndex: 1,
          animation: 'healingAuroraBreathe 12s ease-in-out infinite reverse',
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      />

      {/* 3. Hospital Building Watermark (Rõ nét, trang nghiêm, ấm cúng và sống động) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          backgroundImage: "url('/hospital_building_new.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'left 20% bottom',
          backgroundRepeat: 'no-repeat',
          opacity: 0.42,
          filter: 'contrast(1.18) brightness(1.05) saturate(1.15)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 80% at 35% 85%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.2) 75%, rgba(0,0,0,0) 95%)',
          maskImage: 'radial-gradient(ellipse 85% 80% at 35% 85%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.2) 75%, rgba(0,0,0,0) 95%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
        aria-hidden="true"
      />

      {/* 4. HTML5 Canvas: Interactive Vitality ECG Wave & Starlight Particles */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      />

      {/* 5. Concentric Radar Arcs on Left */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2,
          opacity: 0.45
        }}
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="120" cy="190" r="140" stroke="#38BDF8" strokeWidth="1.5" opacity="0.35" strokeDasharray="4 4" />
        <circle cx="120" cy="190" r="240" stroke="#38BDF8" strokeWidth="1.5" opacity="0.25" />
        <circle cx="120" cy="190" r="360" stroke="#2DD4BF" strokeWidth="1" opacity="0.18" />
        <circle cx="120" cy="190" r="500" stroke="#2DD4BF" strokeWidth="1" opacity="0.1" />
        <path d="M-50,340 Q250,180 600,320 T1300,240" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="1.5" fill="none" />
      </svg>

      {/* 6. Dot Matrix Grid on Top Right */}
      <div
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2.5rem',
          width: '280px',
          height: '220px',
          backgroundImage: 'radial-gradient(rgba(56, 189, 248, 0.35) 1.5px, transparent 1.5px)',
          backgroundSize: '16px 16px',
          opacity: 0.65,
          pointerEvents: 'none',
          zIndex: 2
        }}
        aria-hidden="true"
      />
    </>
  );
};

export default MedicalAuthBackground;
