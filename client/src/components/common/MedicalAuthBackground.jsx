import React, { useEffect, useRef } from 'react';

/**
 * MedicalAuthBackground - Daytime Hospital Garden & Medical Emerald Healing Atmosphere
 * Tái hiện chân thực khung cảnh ban ngày của TTYT Bình Long kết hợp:
 * 1. Ảnh tòa nhà bệnh viện & bầu trời chân thực dưới ánh nắng tự nhiên.
 * 2. Mây trắng bồng bềnh trôi nhẹ nhàng trên nền trời xanh.
 * 3. Cành lá cây xanh tươi rung rinh, đung đưa tự nhiên theo làn gió nhẹ.
 * 4. Các hạt bụi nhỏ phát sáng màu xanh lá cây y tế (Medical Emerald Dust) lơ lửng chữa lành.
 * 5. Sóng xung tim điện tâm đồ ECG và dải sóng uốn lượn phong cách Hình 1.
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

    // 1. Medical Emerald Glowing Dust Particles (Các hạt bụi nhỏ màu xanh lá cây y tế)
    const greenDustParticles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2.4 + 0.8,
      speedY: -(Math.random() * 0.35 + 0.12),
      speedX: (Math.random() - 0.4) * 0.35 + 0.1, // Drifting gently towards right like wind
      alpha: Math.random() * 0.65 + 0.25,
      pulseSpeed: Math.random() * 0.025 + 0.015,
      pulseOffset: Math.random() * Math.PI * 2,
      color: ['#10B981', '#34D399', '#059669', '#6EE7B7', '#A7F3D0', '#22C55E', '#0284C7'][Math.floor(Math.random() * 7)]
    }));

    // 2. Gentle Floating Green Leaves (Lá cây rơi nhẹ trong gió)
    const floatingLeaves = Array.from({ length: 9 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 9 + 6,
      speedY: Math.random() * 0.35 + 0.15,
      speedX: Math.random() * 0.5 + 0.2, // Drift with wind
      angle: Math.random() * Math.PI * 2,
      angularSpeed: (Math.random() - 0.5) * 0.02,
      alpha: Math.random() * 0.45 + 0.35,
      swayOffset: Math.random() * Math.PI * 2,
      color: ['#16A34A', '#15803D', '#22C55E', '#10B981'][Math.floor(Math.random() * 4)]
    }));

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.015;

      // A. Realtime Cyan ECG Heartbeat Wave along bottom (Nhịp tim y tế xanh biển)
      const ecgY = canvas.height * 0.84;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#0284C7';

      for (let x = 0; x < canvas.width; x += 3) {
        const normX = (x + time * 95) % canvas.width;
        let yOffset = 0;
        const cycle = normX % 380;
        if (cycle > 120 && cycle < 140) {
          yOffset = Math.sin((cycle - 120) / 20 * Math.PI) * -11;
        } else if (cycle >= 150 && cycle < 158) {
          yOffset = ((cycle - 150) / 8) * 8;
        } else if (cycle >= 158 && cycle < 172) {
          yOffset = Math.sin((cycle - 158) / 14 * Math.PI) * -56;
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

      // B. Medical Emerald Dust Particles (Hạt bụi nhỏ màu xanh lá cây y tế lơ lửng)
      greenDustParticles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.x < -10) p.x = canvas.width + 10;

        const curAlpha = p.alpha * (0.65 + 0.35 * Math.sin(time * 2.8 + p.pulseOffset));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, curAlpha));
        ctx.shadowBlur = 9;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });

      // C. Falling Gentle Leaves (Lá cây xanh đung đưa bay trong gió)
      floatingLeaves.forEach((l) => {
        l.y += l.speedY;
        l.x += l.speedX + Math.sin(time * 2 + l.swayOffset) * 0.4;
        l.angle += l.angularSpeed;

        if (l.y > canvas.height + 20) {
          l.y = -20;
          l.x = Math.random() * canvas.width;
        }
        if (l.x > canvas.width + 20) l.x = -20;

        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.angle);
        ctx.fillStyle = l.color;
        ctx.globalAlpha = l.alpha;

        // Draw leaf oval shape
        ctx.beginPath();
        ctx.ellipse(0, 0, l.size, l.size * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

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
        /* Realistic Slow Clouds Drift (Mây trôi bồng bềnh) */
        @keyframes cloudFloatSlow {
          0% { transform: translateX(-15%); }
          100% { transform: translateX(115%); }
        }

        @keyframes cloudFloatMedium {
          0% { transform: translateX(-35%); }
          100% { transform: translateX(105%); }
        }

        /* Gentle Swaying Foliage / Tree Branches (Cành lá rung rinh đung đưa theo gió) */
        @keyframes leftBranchSway {
          0% { transform: rotate(0deg) scale(1); }
          35% { transform: rotate(2.2deg) scale(1.01) translateY(-2px); }
          70% { transform: rotate(-1.6deg) scale(0.99) translateY(1px); }
          100% { transform: rotate(0deg) scale(1); }
        }

        @keyframes rightBranchSway {
          0% { transform: rotate(0deg) scale(1); }
          40% { transform: rotate(-2.5deg) scale(1.015) translateY(-3px); }
          75% { transform: rotate(1.8deg) scale(0.99) translateY(2px); }
          100% { transform: rotate(0deg) scale(1); }
        }

        @keyframes leafFlutter {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(4deg) skewX(2deg); }
        }

        /* Subtle Ambient Sunbeam Glow */
        @keyframes sunRayGlow {
          0%, 100% { opacity: 0.45; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.65; transform: scale(1.05) rotate(2deg); }
        }
      `}</style>

      {/* 1. Base Hospital Background Photo (Ảnh công trình thực tế ban ngày rõ nét) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('/hospital_building_new.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 45%',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
          filter: 'contrast(1.05) saturate(1.1) brightness(1.02)'
        }}
        aria-hidden="true"
      />

      {/* 2. Soft Natural Daylight & Sky Atmospheric Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(224, 242, 254, 0.45) 0%, rgba(240, 253, 244, 0.25) 40%, rgba(248, 250, 252, 0.7) 85%, rgba(241, 245, 249, 0.95) 100%)',
          zIndex: 1,
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      />

      {/* 3. Soft Drifting Clouds (Mây trôi tự nhiên trên bầu trời) */}
      <div
        style={{
          position: 'absolute',
          top: '2%',
          left: 0,
          width: '600px',
          height: '200px',
          background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.35) 50%, transparent 80%)',
          filter: 'blur(25px)',
          zIndex: 2,
          animation: 'cloudFloatSlow 55s linear infinite',
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      />

      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: '20%',
          width: '500px',
          height: '160px',
          background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.25) 55%, transparent 80%)',
          filter: 'blur(20px)',
          zIndex: 2,
          animation: 'cloudFloatMedium 42s linear infinite',
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      />

      {/* 4. Realistic Top-Left Swaying Tree Foliage (Cành lá cây xanh mát góc trái rung rinh trong gió) */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          left: '-25px',
          width: '360px',
          height: '420px',
          transformOrigin: 'top left',
          animation: 'leftBranchSway 7s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 3
        }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 360 420" width="100%" height="100%" fill="none">
          {/* Background Shadow Leaves */}
          <g opacity="0.35" filter="blur(3px)">
            <ellipse cx="60" cy="80" rx="45" ry="25" fill="#14532D" transform="rotate(-25 60 80)" />
            <ellipse cx="110" cy="140" rx="55" ry="30" fill="#14532D" transform="rotate(15 110 140)" />
            <ellipse cx="70" cy="220" rx="50" ry="28" fill="#14532D" transform="rotate(-10 70 220)" />
          </g>

          {/* Main Organic Branches */}
          <path d="M0,0 Q80,70 160,130 Q220,180 250,260" stroke="#4B3621" strokeWidth="6" strokeLinecap="round" opacity="0.75" />
          <path d="M70,60 Q130,110 180,180" stroke="#5C4033" strokeWidth="4" strokeLinecap="round" opacity="0.75" />
          <path d="M30,120 Q90,200 130,280" stroke="#5C4033" strokeWidth="3.5" strokeLinecap="round" opacity="0.7" />

          {/* Foreground Lush Leaves with Rich Medical Green Tones */}
          {/* Cluster 1 - Top Left */}
          <g style={{ transformOrigin: '40px 50px', animation: 'leafFlutter 4s ease-in-out infinite' }}>
            <path d="M10,20 C35,10 65,30 50,55 C35,70 15,50 10,20 Z" fill="#15803D" />
            <path d="M35,35 C55,20 85,35 75,60 C60,80 40,60 35,35 Z" fill="#16A34A" />
            <path d="M20,60 C40,45 70,60 60,85 C45,105 25,85 20,60 Z" fill="#22C55E" opacity="0.9" />
          </g>

          {/* Cluster 2 - Middle Branch */}
          <g style={{ transformOrigin: '120px 130px', animation: 'leafFlutter 5s ease-in-out infinite 0.5s' }}>
            <path d="M90,95 C120,80 155,100 140,130 C120,150 95,130 90,95 Z" fill="#15803D" />
            <path d="M125,120 C155,105 185,125 175,155 C155,175 130,155 125,120 Z" fill="#16A34A" />
            <path d="M105,150 C135,135 165,155 155,185 C135,205 110,185 105,150 Z" fill="#22C55E" opacity="0.95" />
            <path d="M140,165 C170,150 195,170 185,195 C170,215 145,195 140,165 Z" fill="#4ADE80" opacity="0.85" />
          </g>

          {/* Cluster 3 - Lower Drooping Leaves */}
          <g style={{ transformOrigin: '80px 220px', animation: 'leafFlutter 6s ease-in-out infinite 1s' }}>
            <path d="M50,180 C80,165 110,185 100,215 C85,235 60,215 50,180 Z" fill="#15803D" />
            <path d="M80,210 C110,195 140,215 130,245 C115,265 90,245 80,210 Z" fill="#16A34A" />
            <path d="M60,240 C90,225 120,245 110,275 C95,295 70,275 60,240 Z" fill="#22C55E" />
            <path d="M95,260 C125,245 150,265 140,290 C125,310 100,290 95,260 Z" fill="#86EFAC" opacity="0.8" />
          </g>
        </svg>
      </div>

      {/* 5. Top-Right Soft Foliage (Cành lá cây góc phải nhẹ nhàng) */}
      <div
        style={{
          position: 'absolute',
          top: '-15px',
          right: '-15px',
          width: '280px',
          height: '320px',
          transformOrigin: 'top right',
          animation: 'rightBranchSway 6.5s ease-in-out infinite 0.7s',
          pointerEvents: 'none',
          zIndex: 3
        }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 280 320" width="100%" height="100%" fill="none">
          <g opacity="0.3" filter="blur(2px)">
            <ellipse cx="220" cy="70" rx="40" ry="22" fill="#14532D" transform="rotate(20 220 70)" />
            <ellipse cx="170" cy="130" rx="45" ry="25" fill="#14532D" transform="rotate(-15 170 130)" />
          </g>
          <path d="M280,0 Q200,60 140,120 Q90,170 60,240" stroke="#4B3621" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
          <g style={{ transformOrigin: '200px 70px', animation: 'leafFlutter 4.5s ease-in-out infinite' }}>
            <path d="M250,30 C225,15 195,35 210,60 C225,75 245,55 250,30 Z" fill="#15803D" />
            <path d="M220,55 C195,40 165,60 180,85 C195,100 215,80 220,55 Z" fill="#16A34A" />
            <path d="M180,80 C155,65 125,85 140,110 C155,125 175,105 180,80 Z" fill="#22C55E" opacity="0.9" />
            <path d="M150,110 C125,95 95,115 110,140 C125,155 145,135 150,110 Z" fill="#4ADE80" opacity="0.8" />
          </g>
        </svg>
      </div>

      {/* 6. HTML5 Canvas: Interactive Medical Green Dust & Realtime ECG Line */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 4,
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      />

      {/* 7. Bottom Left Decorative Soft Wave Shape (Dải sóng y tế mềm mại góc trái phong cách Hình 1) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '420px',
          height: '160px',
          background: 'linear-gradient(135deg, rgba(224, 242, 254, 0.75) 0%, rgba(240, 253, 244, 0.45) 60%, transparent 100%)',
          borderTopRightRadius: '100px',
          filter: 'blur(8px)',
          zIndex: 2,
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      />

      {/* 8. Dot Matrix Grid on Bottom Left */}
      <div
        style={{
          position: 'absolute',
          bottom: '2.5rem',
          left: '2rem',
          width: '160px',
          height: '90px',
          backgroundImage: 'radial-gradient(#0284C7 1.5px, transparent 1.5px)',
          backgroundSize: '14px 14px',
          opacity: 0.35,
          pointerEvents: 'none',
          zIndex: 3
        }}
        aria-hidden="true"
      />

      {/* 9. Dot Matrix Grid on Top Right */}
      <div
        style={{
          position: 'absolute',
          top: '2.5rem',
          right: '2.5rem',
          width: '200px',
          height: '140px',
          backgroundImage: 'radial-gradient(#0284C7 1.5px, transparent 1.5px)',
          backgroundSize: '16px 16px',
          opacity: 0.3,
          pointerEvents: 'none',
          zIndex: 2
        }}
        aria-hidden="true"
      />
    </>
  );
};

export default MedicalAuthBackground;
