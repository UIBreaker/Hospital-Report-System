import React, { useEffect, useRef } from 'react';

/**
 * MedicalAuthBackground - Obsidian Glassmorphism Cyber-Medical Background
 * Đồng bộ tuyệt đối với phong cách điện ảnh cao cấp của Cổng Y Tế
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

    // 1. Floating Luminous Medical Nano Particles
    const particles = Array.from({ length: 48 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2.4 + 0.8,
      speedY: -(Math.random() * 0.45 + 0.15),
      speedX: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.65 + 0.25,
      pulseSpeed: Math.random() * 0.03 + 0.015,
      pulseOffset: Math.random() * Math.PI * 2,
      color: ['#38BDF8', '#2DD4BF', '#10B981', '#60A5FA', '#A7F3D0', '#FFFFFF', '#C084FC'][Math.floor(Math.random() * 7)]
    }));

    // 2. Floating Translucent Medical Crosses
    const crosses = Array.from({ length: 10 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 12 + 8,
      speedY: -(Math.random() * 0.3 + 0.08),
      speedX: (Math.random() - 0.5) * 0.2,
      alpha: Math.random() * 0.3 + 0.1,
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.008,
      color: ['#38BDF8', '#2DD4BF', '#818CF8'][Math.floor(Math.random() * 3)]
    }));

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.015;

      // A. Realtime Glowing Cyan ECG Wave across canvas
      const ecgY = canvas.height * 0.78;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#38BDF8';

      for (let x = 0; x < canvas.width; x += 3) {
        const normX = (x + time * 110) % canvas.width;
        let yOffset = 0;
        const cycle = normX % 380;
        if (cycle > 120 && cycle < 140) {
          yOffset = Math.sin((cycle - 120) / 20 * Math.PI) * -12;
        } else if (cycle >= 150 && cycle < 158) {
          yOffset = ((cycle - 150) / 8) * 9;
        } else if (cycle >= 158 && cycle < 172) {
          yOffset = Math.sin((cycle - 158) / 14 * Math.PI) * -65;
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

        const curAlpha = p.alpha * (0.6 + 0.4 * Math.sin(time * 3 + p.pulseOffset));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, curAlpha));
        ctx.shadowBlur = 10;
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

        if (c.y < -25) {
          c.y = canvas.height + 25;
          c.x = Math.random() * canvas.width;
        }
        if (c.x < -25) c.x = canvas.width + 25;
        if (c.x > canvas.width + 25) c.x = -25;

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
        @keyframes obsidianAuroraDrift {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.45; }
          50% { transform: scale(1.15) translate(25px, -20px); opacity: 0.75; }
        }

        @keyframes laserRingSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* 1. Deep Obsidian Void Foundation */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#030914',
          zIndex: 0,
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      />

      {/* 2. Radiant Cyber-Medical Auroras (Cyan, Teal, Sapphire, Indigo) */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '10%',
          width: '750px',
          height: '750px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.28) 0%, rgba(30, 58, 138, 0.18) 45%, transparent 70%)',
          filter: 'blur(90px)',
          zIndex: 1,
          animation: 'obsidianAuroraDrift 10s ease-in-out infinite',
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      />

      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '5%',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(20, 184, 166, 0.14) 45%, transparent 70%)',
          filter: 'blur(95px)',
          zIndex: 1,
          animation: 'obsidianAuroraDrift 13s ease-in-out infinite reverse',
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      />

      <div
        style={{
          position: 'absolute',
          top: '30%',
          right: '35%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 65%)',
          filter: 'blur(80px)',
          zIndex: 1,
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      />

      {/* 3. HTML5 Canvas: Interactive Glowing ECG Wave & Starlight Nano Particles */}
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

      {/* 4. Concentric Laser Radar Arcs on Left */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2,
          opacity: 0.5
        }}
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="120" cy="190" r="140" stroke="#38BDF8" strokeWidth="1.5" opacity="0.35" strokeDasharray="4 4" />
        <circle cx="120" cy="190" r="240" stroke="#38BDF8" strokeWidth="1.5" opacity="0.25" />
        <circle cx="120" cy="190" r="360" stroke="#0284C7" strokeWidth="1" opacity="0.18" />
        <circle cx="120" cy="190" r="500" stroke="#0284C7" strokeWidth="1" opacity="0.12" />
        <path d="M-50,340 Q250,180 600,320 T1300,240" stroke="rgba(56, 189, 248, 0.2)" strokeWidth="1.5" fill="none" />
      </svg>

      {/* 5. Hospital Building Watermark with Midnight Vignette Mask */}
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
          opacity: 0.16,
          filter: 'contrast(1.15) brightness(0.95)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 30% 90%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 90%)',
          maskImage: 'radial-gradient(ellipse 75% 70% at 30% 90%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 90%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
        aria-hidden="true"
      />

      {/* 6. High-Tech Dot Matrix Grid on Top Right */}
      <div
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2.5rem',
          width: '280px',
          height: '220px',
          backgroundImage: 'radial-gradient(rgba(56, 189, 248, 0.35) 1.5px, transparent 1.5px)',
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
