import React, { useEffect, useState } from 'react';

const LockSeal = ({ locked }) => (
  <span className={`lock-seal${locked ? ' is-locked' : ''}`} aria-hidden="true">
    <svg width="28" height="32" viewBox="0 0 36 40">
      <path className="lockb" d="M27 27C27 34.1797 21.1797 40 14 40C6.8203 40 1 34.1797 1 27C1 19.8203 6.8203 14 14 14C21.1797 14 27 19.8203 27 27ZM15.6298 26.5191C16.4544 25.9845 17 25.056 17 24C17 22.3431 15.6569 21 14 21C12.3431 21 11 22.3431 11 24C11 25.056 11.5456 25.9845 12.3702 26.5191L11 32H17L15.6298 26.5191Z" />
      <path className="lock" d="M6 21V10C6 5.58172 9.58172 2 14 2C18.4183 2 22 5.58172 22 10V21" />
      <path className="bling" d="M29 20L31 22M31.5 15H34.5M29 10L31 8" />
    </svg>
  </span>
);

const LockSequence = ({ date, departments, onClose }) => {
  const [step, setStep] = useState(0);
  const submittedCount = departments.filter(dept => dept.submitted).length;

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setStep(departments.length);
      return;
    }
    const timer = setInterval(() => setStep(current => {
      if (current >= departments.length) {
        clearInterval(timer);
        return current;
      }
      return current + 1;
    }), 190);
    return () => clearInterval(timer);
  }, [departments.length]);

  const [year, month, day] = date.split('-');
  const dateLabel = `${Number(day)}/${Number(month)}/${year}`;
  const complete = step >= departments.length;

  return (
    <div className="lock-sequence-overlay" role="dialog" aria-modal="true" aria-label="Tiến trình khóa sổ toàn viện">
      <style>{`
        .lock-sequence-overlay { position:fixed; inset:0; z-index:999999; background:rgba(8,22,46,.92); backdrop-filter:blur(10px); display:grid; place-items:center; padding:16px; box-sizing:border-box; }
        .lock-sequence-card { width:min(760px,100%); max-height:92vh; overflow:auto; padding:28px; box-sizing:border-box; border-radius:22px; color:#fff; background:linear-gradient(145deg,#102c56,#0a1d3b); border:1px solid #4775b4; box-shadow:0 24px 70px rgba(0,0,0,.42); }
        .lock-sequence-card h2 { margin:0 0 8px; font-size:1.5rem; line-height:1.25; }
        .lock-sequence-card p { margin:0; color:#cbd5e1; line-height:1.5; }
        .lock-sequence-progress { height:8px; margin:22px 0 12px; border-radius:99px; background:#294568; overflow:hidden; }
        .lock-sequence-progress > span { display:block; height:100%; background:#20cca5; transition:width .2s ease; }
        .lock-sequence-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:10px; margin:18px 0 22px; }
        .lock-sequence-item { display:flex; align-items:center; gap:10px; min-width:0; padding:10px; border:1px solid #385675; border-radius:12px; background:rgba(255,255,255,.04); transition:background .3s,border-color .3s,transform .3s; }
        .lock-sequence-item.done { border-color:#20cca5; background:rgba(32,204,165,.12); transform:translateY(-2px); }
        .lock-sequence-item.missing { opacity:.65; }
        .lock-sequence-name { min-width:0; font-size:.8rem; font-weight:700; line-height:1.3; }
        .lock-sequence-name small { display:block; color:#9fbbd8; font-size:.7rem; font-weight:500; margin-top:3px; }
        .lock-seal { display:grid; place-items:center; width:42px; height:42px; flex:none; border-radius:50%; background:#ff5b5b; transition:background .3s ease; }
        .lock-seal svg { overflow:visible; fill:none; }
        .lock-seal .lockb { fill:#fff; transform:rotate(8deg); transform-origin:14px 22px; transition:transform .3s ease; }
        .lock-seal .lock { stroke:#fff; stroke-width:4; stroke-linejoin:round; stroke-linecap:round; transform:translateY(-5px) rotate(-12deg); transform-origin:6px 20px; transition:transform .38s cubic-bezier(.2,1.5,.5,1); }
        .lock-seal .bling { stroke:#fff; stroke-width:2.5; stroke-linecap:round; stroke-dasharray:3; stroke-dashoffset:15; opacity:0; }
        .lock-seal.is-locked { background:#20cca5; }
        .lock-seal.is-locked .lockb, .lock-seal.is-locked .lock { transform:none; }
        .lock-seal.is-locked .bling { animation:lock-bling .4s .2s forwards; }
        @keyframes lock-bling { to { stroke-dashoffset:9; opacity:1; } }
        @media (max-width:650px) { .lock-sequence-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } .lock-sequence-card { padding:20px; } }
        @media (max-width:420px) { .lock-sequence-grid { grid-template-columns:1fr; } }
        @media (prefers-reduced-motion:reduce) { .lock-sequence-overlay *, .lock-sequence-overlay *::before { transition:none !important; animation:none !important; } }
      `}</style>
      <div className="lock-sequence-card">
        <h2>{complete ? 'Đã khóa sổ giao ban' : 'Đang khóa sổ toàn viện'}</h2>
        <p>Ngày {dateLabel} · {submittedCount} khoa/phòng đã có báo cáo được niêm phong. Khoa chưa nộp sẽ không bị tính là đã khóa.</p>
        <div className="lock-sequence-progress" role="progressbar" aria-valuenow={step} aria-valuemin={0} aria-valuemax={departments.length} aria-label="Tiến trình hiển thị khóa sổ">
          <span style={{ width: `${departments.length ? step / departments.length * 100 : 100}%` }} />
        </div>
        <p aria-live="polite">{complete ? `Hoàn tất ${departments.length}/${departments.length} khoa/phòng` : `Đang xử lý khoa ${step + 1}/${departments.length}`}</p>
        <div className="lock-sequence-grid">
          {departments.map((dept, index) => (
            <div className={`lock-sequence-item${step > index && dept.submitted ? ' done' : ''}${!dept.submitted ? ' missing' : ''}`} key={dept.code}>
              <LockSeal locked={step > index && dept.submitted} />
              <div className="lock-sequence-name">{index + 1}. {dept.name}<small>{!dept.submitted ? 'Chưa nộp báo cáo' : step > index ? 'Đã khóa sổ' : 'Chờ niêm phong'}</small></div>
            </div>
          ))}
        </div>
        <button type="button" onClick={onClose} disabled={!complete} style={{ padding:'10px 22px', border:0, borderRadius:9, background:complete ? '#20cca5' : '#57718e', color:'#fff', fontWeight:800, cursor:complete ? 'pointer' : 'wait' }}>Hoàn tất</button>
      </div>
    </div>
  );
};

export default LockSequence;
