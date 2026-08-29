import React, { useState, useEffect, useRef } from 'react';

/**
 * High-Performance Smooth Animated Number Counter
 * Uses requestAnimationFrame with cubic-bezier easing and explosive visual pop
 */
const CountUpNumber = ({
  value = 0,
  duration = 1000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  style = {},
  enableExplosion = true
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isPopping, setIsPopping] = useState(false);
  const startValueRef = useRef(0);
  const startTimeRef = useRef(null);
  const animationFrameRef = useRef(null);

  const target = typeof value === 'number' ? value : (Number(value) || 0);

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

    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
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
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toString();

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
