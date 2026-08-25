import React, { useEffect, useRef } from 'react';

/**
 * MedicalAuthBackground - Light Clinical Crystal Cyber-Medical Background
 * Giao diện Y Tế Ánh Sáng Tinh Khiết (Pristine Medical White & Crystal Cyan)
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

    // 1. Floating Soft Medical Nano Particles
    const particles = Array.from({ length: 38 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2.2 + 0.8,
      speedY: -(Math.random() * 0.35 + 0.12),
      speedX: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.45 + 0.15,
      pulseSpeed: Math.random() * 0.025 + 0.012,
      pulseOffset: Math.random() * Math.PI * 2,
      color: ['#0284C7', '#0D9488', '#10B981', '#38BDF8', '#60A5FA'][Math.floor(Math.random() * 5)]
    }));

    // 2. Floating Translucent Medical Crosses (+)
    const crosses = Array.from({ length: 8 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 10 + 7,
      speedY: -(Math.random() * 0.22 + 0.06),
      speedX: (Math.random() - 0.5) * 0.15,
      alpha: Math.random() * 0.18 + 0.08,
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.006,
      color: ['#0284C7', '#0D9488', '#059669'][Math.floor(Math.random() * 3)]
    }));

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.015;

      // A. Realtime Cyan-Ocean ECG Wave across bottom-mid canvas
      const ecgY = canvas.height * 0.82;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.35)';
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(2, 132, 199, 0.4)';

      for (let x = 0; x < canvas.width; x += 3) {
        const normX = (x + time * 105) % canvas.width;
        let yOffset = 0;
        const cycle = normX % 380;
        if (cycle > 120 && cycle < 140) {
          yOffset = Math.sin((cycle - 120) / 20 * Math.PI) * -11;
        } else if (cycle >= 150 && cycle < 158) {
          yOffset = ((cycle - 150) / 8) * 8;
        } else if (cycle >= 158 && cycle < 172) {
          yOffset = Math.sin((cycle - 158) / 14 * Math.PI) * -58;
        } else if (cycle >= 172 && cycle < 182) {
          yOffset = ((cycle - 172) / 10) * 12;
        } else if (cycle >= 210 && cycle < 245) {
          yOffset = Math.sin((cycle - 210) / 35 * Math.PI) * -18;
        }
        if (x === 0) ctx.moveTo(x, ecgY + yOffset);
        else ctx.lineTo(x, ecgY + yOffset);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // B. Floating Medical Nano Particles
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        const curAlpha = p.alpha * (0.65 + 0.35 * Math.sin(time * 2.5 + p.pulseOffset));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, curAlpha));
        ctx.fill();
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
        @keyframes lightAuroraPulse {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.65; }
          50% { transform: scale(1.12) translate(20px, -15px); opacity: 0.9; }
        }
      `}</style>

      {/* 1. Pristine Medical Light Base Gradient Foundation */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, #F0FDF4 0%, #E0F2FE 24%, #DBEAFE 52%, #EFF6FF 78%, #F8FAFC 100%)',
          zIndex: 0,
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      />

      {/* 2. Soft Glowing Medical Auroras (Cyan, Mint Teal, Sky Sapphire) */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '5%',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.28) 0%, rgba(14, 165, 233, 0.15) 45%, transparent 70%)',
          filter: 'blur(90px)',
          zIndex: 1,
          animation: 'lightAuroraPulse 11s ease-in-out infinite',
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      />

      <div
        style={{
          position: 'absolute',
          bottom: '-12%',
          right: '8%',
          width: '650px',
          height: '650px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(52, 211, 153, 0.22) 0%, rgba(45, 212, 191, 0.12) 45%, transparent 70%)',
          filter: 'blur(90px)',
          zIndex: 1,
          animation: 'lightAuroraPulse 13s ease-in-out infinite reverse',
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      />

      {/* 3. HTML5 Canvas: Interactive Medical ECG Line & Particles */}
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

      {/* 4. Concentric Radar Arcs on Left */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2,
          opacity: 0.55
        }}
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="120" cy="190" r="140" stroke="#0284C7" strokeWidth="1.5" opacity="0.25" strokeDasharray="4 4" />
        <circle cx="120" cy="190" r="240" stroke="#0284C7" strokeWidth="1.5" opacity="0.18" />
        <circle cx="120" cy="190" r="360" stroke="#0369A1" strokeWidth="1" opacity="0.12" />
        <circle cx="120" cy="190" r="500" stroke="#0369A1" strokeWidth="1" opacity="0.08" />
        <path d="M-50,340 Q250,180 600,320 T1300,240" stroke="rgba(2, 132, 199, 0.18)" strokeWidth="1.5" fill="none" />
      </svg>

      {/* 5. Hospital Building Watermark with Soft Vignette Blend */}
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
          opacity: 0.22,
          filter: 'contrast(1.05) brightness(1.04)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 30% 90%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 90%)',
          maskImage: 'radial-gradient(ellipse 75% 70% at 30% 90%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 90%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
        aria-hidden="true"
      />

      {/* 6. Dot Matrix Grid on Top Right */}
      <div
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2.5rem',
          width: '280px',
          height: '220px',
          backgroundImage: 'radial-gradient(rgba(2, 132, 199, 0.25) 1.5px, transparent 1.5px)',
          backgroundSize: '16px 16px',
          opacity: 0.6,
          pointerEvents: 'none',
          zIndex: 2
        }}
        aria-hidden="true"
      />
    </>
  );
};

export default MedicalAuthBackground;
