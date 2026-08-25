import React, { useEffect, useRef } from 'react';

/**
 * MedicalAuthBackground - Đồng bộ hiệu ứng y tế chất lượng cao cho trang Đăng Nhập & Đăng Ký
 * Gồm:
 * 1. 60fps HTML5 Canvas với sóng xung tim ECG phát sáng + Hạt Nano y tế + Dấu thập y tế trôi nổi
 * 2. Hào quang cực quang Y tế (Cyan, Teal, Sapphire)
 * 3. Lưới tọa độ Dot Grid + Vòng cung Radar y tế
 * 4. Watermark công trình bệnh viện hòa quyện mượt mà
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

    // 1. Floating Nano Medical Particles
    const particles = Array.from({ length: 42 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2.2 + 0.8,
      speedY: -(Math.random() * 0.4 + 0.12),
      speedX: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.55 + 0.15,
      pulseSpeed: Math.random() * 0.025 + 0.01,
      pulseOffset: Math.random() * Math.PI * 2,
      color: ['#38BDF8', '#2DD4BF', '#10B981', '#60A5FA', '#A7F3D0', '#FFFFFF'][Math.floor(Math.random() * 6)]
    }));

    // 2. Floating Translucent Medical Crosses
    const crosses = Array.from({ length: 8 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 10 + 7,
      speedY: -(Math.random() * 0.25 + 0.08),
      speedX: (Math.random() - 0.5) * 0.15,
      alpha: Math.random() * 0.25 + 0.1,
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.008,
      color: '#38BDF8'
    }));

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016;

      // A. Realtime Glowing ECG Heartbeat Line across the canvas
      const ecgY = canvas.height * 0.76;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#0284C7';

      for (let x = 0; x < canvas.width; x += 3) {
        const normX = (x + time * 105) % canvas.width;
        let yOffset = 0;
        const cycle = normX % 360;
        if (cycle > 120 && cycle < 140) {
          yOffset = Math.sin((cycle - 120) / 20 * Math.PI) * -10;
        } else if (cycle >= 150 && cycle < 158) {
          yOffset = ((cycle - 150) / 8) * 8;
        } else if (cycle >= 158 && cycle < 172) {
          yOffset = Math.sin((cycle - 158) / 14 * Math.PI) * -55;
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
        // Horizontal bar
        ctx.fillRect(-w / 2, -thick / 2, w, thick);
        // Vertical bar
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
        @keyframes medicalAuroraPulse {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.55; }
          50% { transform: scale(1.1) translate(15px, -15px); opacity: 0.85; }
        }

        @keyframes radarSweepSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* 1. Base Gradient Foundation */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(130deg, #E0F2FE 0%, #BAE6FD 22%, #7DD3FC 48%, #38BDF8 72%, #0284C7 100%)',
          zIndex: 0,
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      />

      {/* 2. Medical Aurora Glow Spheres */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          right: '5%',
          width: '650px',
          height: '650px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.45) 0%, rgba(59, 130, 246, 0.25) 45%, transparent 70%)',
          filter: 'blur(65px)',
          zIndex: 1,
          animation: 'medicalAuroraPulse 10s ease-in-out infinite',
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      />

      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '2%',
          width: '580px',
          height: '580px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, rgba(45, 212, 191, 0.2) 45%, transparent 70%)',
          filter: 'blur(65px)',
          zIndex: 1,
          animation: 'medicalAuroraPulse 12s ease-in-out infinite reverse',
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

      {/* 4. Concentric Medical Radar Arcs on Left */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2,
          opacity: 0.65
        }}
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="120" cy="190" r="140" stroke="#0284C7" strokeWidth="1.5" opacity="0.3" strokeDasharray="4 4" />
        <circle cx="120" cy="190" r="240" stroke="#0284C7" strokeWidth="1.5" opacity="0.25" />
        <circle cx="120" cy="190" r="360" stroke="#0369A1" strokeWidth="1" opacity="0.18" />
        <circle cx="120" cy="190" r="500" stroke="#0369A1" strokeWidth="1" opacity="0.12" />
        <path d="M-50,340 Q250,180 600,320 T1300,240" stroke="rgba(2, 132, 199, 0.25)" strokeWidth="1.5" fill="none" />
      </svg>

      {/* 5. Hospital Building Watermark with Soft Fade Mask */}
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
          opacity: 0.28,
          filter: 'contrast(1.08) brightness(1.02)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 30% 90%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0) 90%)',
          maskImage: 'radial-gradient(ellipse 75% 70% at 30% 90%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0) 90%)',
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
          backgroundImage: 'radial-gradient(rgba(14, 165, 233, 0.45) 1.5px, transparent 1.5px)',
          backgroundSize: '16px 16px',
          opacity: 0.7,
          pointerEvents: 'none',
          zIndex: 2
        }}
        aria-hidden="true"
      />
    </>
  );
};

export default MedicalAuthBackground;
