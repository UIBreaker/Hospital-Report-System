import React, { useState, useEffect, useRef } from 'react';

/**
 * High-Performance Smooth Animated Number Counter
 * Uses requestAnimationFrame with cubic-bezier easing and explosive visual pop
 */
const CountUpNumber = ({
  value,
  end,
  duration = 1000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  style = {},
  enableExplosion = true
}) => {
  const rawTarget = end !== undefined ? end : (value !== undefined ? value : 0);
  const target = typeof rawTarget === 'number' ? rawTarget : (Number(rawTarget) || 0);

  const [displayValue, setDisplayValue] = useState(target);
  const [isPopping, setIsPopping] = useState(false);
  const startValueRef = useRef(0);
  const startTimeRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const startVal = startValueRef.current;
    const endVal = target;
    const change = endVal - startVal;

    if (change === 0) {
      setDisplayValue(endVal);
      return;
    }

    setIsPopping(true);
    const popTimer = setTimeout(() => setIsPopping(false), 500);

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const current = startVal + change * easedProgress;
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endVal);
        startValueRef.current = endVal;
        startTimeRef.current = null;
      }
    };

    startTimeRef.current = null;
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      clearTimeout(popTimer);
    };
  }, [target, duration]);

  const formatted = decimals > 0
    ? Number(displayValue || 0).toFixed(decimals)
    : Math.round(Number(displayValue || 0)).toString();

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: enableExplosion && isPopping ? 'scale(1.08)' : 'scale(1)',
        filter: enableExplosion && isPopping ? 'brightness(1.1)' : 'none',
        ...style
      }}
    >
      {prefix}{formatted}{suffix}
    </span>
  );
};

export default CountUpNumber;
