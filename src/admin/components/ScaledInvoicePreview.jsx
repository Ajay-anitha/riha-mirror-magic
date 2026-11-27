import React, { useRef, useState, useLayoutEffect } from 'react';

/**
 * Proportionally scales an A4 invoice sheet to fit completely within the
 * available screen area without vertical, horizontal, or internal scrollbars.
 * Print styles (@media print) reset transform and sizing for native A4 pagination.
 */
export default function ScaledInvoicePreview({ children, depsKey }) {
  const stageRef = useRef(null);
  const sheetRef = useRef(null);
  const [scaleState, setScaleState] = useState({ scale: 1, width: 794, height: null });

  useLayoutEffect(() => {
    const stageEl = stageRef.current;
    const sheetEl = sheetRef.current;
    if (!stageEl || !sheetEl) return;

    let rafId = null;

    const updateScale = () => {
      const prevTransform = sheetEl.style.transform;
      sheetEl.style.transform = 'none';
      const naturalW = sheetEl.offsetWidth || 794;
      const naturalH = sheetEl.offsetHeight || 1123;
      sheetEl.style.transform = prevTransform;

      const availW = Math.max(0, stageEl.clientWidth - 4);
      const availH = Math.max(0, stageEl.clientHeight - 4);

      if (availW <= 0 || availH <= 0 || naturalW <= 0 || naturalH <= 0) return;

      const scaleX = availW / naturalW;
      const scaleY = availH / naturalH;
      const nextScale = Math.min(1, scaleX, scaleY);

      setScaleState((prev) => {
        if (
          Math.abs(prev.scale - nextScale) < 0.002 &&
          prev.width === naturalW &&
          prev.height === naturalH
        ) {
          return prev;
        }
        return { scale: nextScale, width: naturalW, height: naturalH };
      });
    };

    const scheduleUpdate = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateScale);
    };

    updateScale();

    const ro = new ResizeObserver(scheduleUpdate);
    ro.observe(stageEl);
    ro.observe(sheetEl);
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [depsKey]);

  const { scale, width, height } = scaleState;
  const sizerStyle =
    width && height
      ? {
          width: `${Math.ceil(width * scale)}px`,
          height: `${Math.ceil(height * scale)}px`,
          position: 'relative',
          flexShrink: 0
        }
      : { width: '100%', position: 'relative' };

  const sheetStyle = {
    width: '794px',
    transform: `scale(${scale})`,
    transformOrigin: 'top left'
  };

  return (
    <div className="admin-invoice-stage" ref={stageRef}>
      <div className="admin-invoice-sizer" style={sizerStyle}>
        <div className="admin-invoice-a4-sheet" ref={sheetRef} style={sheetStyle}>
          {children}
        </div>
      </div>
    </div>
  );
}
