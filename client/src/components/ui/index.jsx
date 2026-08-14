import React, { useEffect } from 'react';
import { FaSpinner, FaTimes } from 'react-icons/fa';

/* ==========================================================
   BUTTON COMPONENT
   ========================================================== */
export const Button = ({
  className = '',
  variant = 'primary', // 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'outline'
  size = 'md',        // 'sm' | 'md' | 'lg'
  type = 'button',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  children,
  ...props
}) => {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const fullWidthClass = fullWidth ? 'w-full' : '';
  const variantClass = `btn-${variant}`;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`btn ${variantClass} ${sizeClass} ${fullWidthClass} ${className}`.trim()}
      {...props}
    >
      {loading ? (
        <>
          <FaSpinner className="spinner" style={{ marginRight: children ? '0.4rem' : 0 }} />
          {children}
        </>
      ) : (
        <>
          {Icon && <Icon style={{ marginRight: children ? '0.4rem' : 0, fontSize: size === 'sm' ? '0.85em' : '1em' }} />}
          {children}
        </>
      )}
    </button>
  );
};

/* ==========================================================
   CARD & SUB-COMPONENTS
   ========================================================== */
export const Card = ({ className = '', borderAccent, children, ...props }) => {
  const accentStyle = borderAccent ? { borderLeft: `5px solid ${borderAccent}` } : {};
  return (
    <section className={`card ${className}`.trim()} style={{ ...accentStyle, ...(props.style || {}) }} {...props}>
      {children}
    </section>
  );
};

export const CardHeader = ({ className = '', children, ...props }) => (
  <div className={`card-header ${className}`.trim()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', ...(props.style || {}) }} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className = '', children, ...props }) => (
  <h3 className={`card-title ${className}`.trim()} style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', ...(props.style || {}) }} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className = '', children, ...props }) => (
  <p className={`card-desc ${className}`.trim()} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0', ...(props.style || {}) }} {...props}>
    {children}
  </p>
);

export const CardBody = ({ className = '', children, ...props }) => (
  <div className={`card-body ${className}`.trim()} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className = '', children, ...props }) => (
  <div className={`card-footer ${className}`.trim()} style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', ...(props.style || {}) }} {...props}>
    {children}
  </div>
);

/* ==========================================================
   BADGE COMPONENT
   ========================================================== */
export const Badge = ({
  tone = 'info', // 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'purple'
  dot = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <span className={`badge badge-${tone} ${className}`.trim()} {...props}>
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            marginRight: '0.35rem',
            display: 'inline-block'
          }}
        />
      )}
      {children}
    </span>
  );
};

/* ==========================================================
   NOTICE / ALERT COMPONENT
   ========================================================== */
export const Notice = ({
  tone = 'info', // 'info' | 'success' | 'warning' | 'danger'
  title,
  icon,
  onClose,
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`ui-notice ui-notice-${tone} ${className}`.trim()} role="alert" {...props}>
      {icon && <span style={{ fontSize: '1.15rem', flexShrink: 0, marginTop: '2px' }}>{icon}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: children ? '0.25rem' : 0 }}>{title}</div>}
        {children && <div style={{ fontSize: '0.85rem', lineHeight: '1.45', opacity: 0.95 }}>{children}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'currentColor', cursor: 'pointer', opacity: 0.7, padding: '2px', marginLeft: '0.5rem' }}
          aria-label="Đóng thông báo"
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
};

/* ==========================================================
   MODAL COMPONENT (ACCESSIBLE & SMOOTH)
   ========================================================== */
export const Modal = ({
  isOpen = false,
  onClose,
  title,
  description,
  maxWidth = '580px',
  children,
  footer
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose?.();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 9999,
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
          overflow: 'hidden',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Modal Header */}
        <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
          <div>
            {title && <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F2C59', margin: 0 }}>{title}</h3>}
            {description && <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.2rem 0 0' }}>{description}</p>}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#E2E8F0',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#CBD5E1'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#E2E8F0'; }}
              aria-label="Đóng cửa sổ"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/* ==========================================================
   TABLE WRAPPER & TABLE
   ========================================================== */
export const TableWrapper = ({ className = '', stickyHeader = false, children, ...props }) => (
  <div
    className={`table-wrapper ${className}`.trim()}
    style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '12px',
      overflowX: 'auto',
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
      ...(props.style || {})
    }}
    {...props}
  >
    {children}
  </div>
);

export const Table = ({ className = '', children, ...props }) => (
  <table className={`data-table ${className}`.trim()} style={{ width: '100%', borderCollapse: 'collapse', ...(props.style || {}) }} {...props}>
    {children}
  </table>
);

/* ==========================================================
   SKELETON BONE LOADER
   ========================================================== */
export const Skeleton = ({ width = '100%', height = '20px', borderRadius = '6px', className = '', style = {} }) => (
  <div
    className={`skeleton-bone ${className}`.trim()}
    style={{
      width,
      height,
      borderRadius,
      backgroundColor: '#E2E8F0',
      background: 'linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeletonPulse 1.5s infinite ease-in-out',
      ...style
    }}
  />
);

/* ==========================================================
   EMPTY STATE COMPONENT
   ========================================================== */
export const EmptyState = ({
  icon,
  title = 'Không có dữ liệu',
  description = 'Hiện tại chưa có thông tin hoặc bản ghi nào phù hợp.',
  action,
  className = ''
}) => (
  <div
    className={`empty-state ${className}`.trim()}
    style={{
      padding: '3rem 1.5rem',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#64748B'
    }}
  >
    {icon && <div style={{ fontSize: '2.5rem', marginBottom: '0.85rem', opacity: 0.75 }}>{icon}</div>}
    <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.35rem' }}>{title}</h4>
    {description && <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: '420px', margin: '0 0 1.25rem' }}>{description}</p>}
    {action && <div>{action}</div>}
  </div>
);

/* ==========================================================
   FORM FIELD & INPUTS
   ========================================================== */
export const FormField = ({ label, required = false, hint, error, children, className = '', style = {} }) => (
  <div className={`form-group ${className}`.trim()} style={{ marginBottom: '1rem', ...style }}>
    {label && (
      <label style={{ display: 'block', fontWeight: '700', fontSize: '0.82rem', color: '#334155', marginBottom: '0.35rem' }}>
        {label} {required && <span style={{ color: '#DC2626' }}>*</span>}
      </label>
    )}
    {children}
    {hint && !error && <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem', display: 'block' }}>{hint}</span>}
    {error && <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: '600', marginTop: '0.25rem', display: 'block' }}>⚠️ {error}</span>}
  </div>
);

/* ==========================================================
   TABS NAVIGATION COMPONENT
   ========================================================== */
export const Tabs = ({ tabs = [], activeTab, onChange, className = '' }) => (
  <div
    className={`admin-tabs ${className}`.trim()}
    role="tablist"
    style={{
      display: 'flex',
      gap: '0.5rem',
      padding: '0.45rem',
      backgroundColor: '#F1F5F9',
      borderRadius: '12px',
      border: '1px solid #E2E8F0',
      overflowX: 'auto'
    }}
  >
    {tabs.map((tab) => {
      const isActive = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(tab.id)}
          style={{
            padding: '0.65rem 1.1rem',
            borderRadius: '9px',
            border: 'none',
            backgroundColor: isActive ? '#0F2C59' : 'transparent',
            color: isActive ? '#FFFFFF' : '#475569',
            fontWeight: isActive ? '700' : '600',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
            boxShadow: isActive ? '0 4px 10px rgba(15, 44, 89, 0.25)' : 'none'
          }}
        >
          {tab.icon && <span>{tab.icon}</span>}
          <span>{tab.label}</span>
          {tab.badge !== undefined && (
            <span
              style={{
                fontSize: '0.72rem',
                padding: '1px 6px',
                borderRadius: '999px',
                backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                color: isActive ? '#FFFFFF' : '#334155',
                fontWeight: '800'
              }}
            >
              {tab.badge}
            </span>
          )}
        </button>
      );
    })}
  </div>
);
