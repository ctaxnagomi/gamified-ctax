import React, { useState, useRef, useEffect, useCallback } from 'react';
import { NavItem } from '../types';

interface CircularNavProps {
  items: NavItem[];
  activeId: string;
  onSelect: (id: string) => void;
  onRotationChange?: (rotation: number, isDragging: boolean) => void;
  onCenterClick?: () => void;
  themeMode?: 'DEFAULT' | 'DOODLE' | 'CONSOLE';
}

const CircularNav: React.FC<CircularNavProps> = ({
  items,
  activeId,
  onSelect,
  onRotationChange,
  onCenterClick,
  themeMode = 'DEFAULT'
}) => {
  const [rotation, setRotation] = useState(0);
  const currentRotationRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isCenterPressed, setIsCenterPressed] = useState(false);

  const discRef = useRef<HTMLDivElement>(null);
  const lastAngleRef = useRef<number>(0);
  const centerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const velocityRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const dragStartRef = useRef<{ x: number, y: number, time: number } | null>(null);

  // Keep latest onSelect in ref to avoid stale closures in animation loops
  const onSelectRef = useRef(onSelect);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  // Sync state to ref
  useEffect(() => { currentRotationRef.current = rotation; }, [rotation]);

  // Constants
  // For a top-left corner wheel, the "active" zone is pointing into the screen (bottom-right diagonal)
  const SELECTION_ANGLE = 135;

  // Helper to normalize angle to 0-360
  const normalizeAngle = (angle: number) => {
    let a = angle % 360;
    if (a < 0) a += 360;
    return a;
  };

  // Find which item is closest to the selection angle
  const getClosestItemIndex = useCallback((currentRotation: number) => {
    const itemCount = items.length;
    const angleStep = 360 / itemCount;

    let closestIndex = 0;
    let minDiff = Infinity;

    items.forEach((_, index) => {
      const itemAngle = index * angleStep;
      const globalAngle = normalizeAngle(itemAngle + currentRotation);

      // Shortest distance to target SELECTION_ANGLE
      let diff = Math.abs(globalAngle - SELECTION_ANGLE);
      if (diff > 180) diff = 360 - diff;

      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = index;
      }
    });

    return closestIndex;
  }, [items]);

  // Calculate angle from center
  const getAngle = (clientX: number, clientY: number) => {
    if (!discRef.current) return 0;
    const { x, y } = centerRef.current;
    const dx = clientX - x;
    const dy = clientY - y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  // Rotates to specific target angle with animation
  const rotateTo = useCallback((targetRotation: number) => {
    const startRotation = currentRotationRef.current;

    const diff = targetRotation - startRotation;
    const turns = Math.round(diff / 360);
    const optimizedTarget = targetRotation - (turns * 360);

    const animate = () => {
      setRotation(prev => {
        const dist = optimizedTarget - prev;
        const move = dist * 0.1;

        if (Math.abs(dist) < 0.1) {
          currentRotationRef.current = optimizedTarget;
          if (onRotationChange) onRotationChange(optimizedTarget, false);
          animationFrameRef.current = null;
          return optimizedTarget;
        }

        const nextVal = prev + move;
        currentRotationRef.current = nextVal;
        if (onRotationChange) onRotationChange(nextVal, false);
        animationFrameRef.current = requestAnimationFrame(animate);
        return nextVal;
      });
    };
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(animate);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [onRotationChange]);

  // React to activeId changes from parent (e.g. Swipe)
  useEffect(() => {
    // Find index of activeId
    const index = items.findIndex(item => item.id === activeId);
    if (index !== -1) {
      const itemCount = items.length;
      const angleStep = 360 / itemCount;
      const itemAngle = index * angleStep;

      // Calculate target rotation to bring this item to SELECTION_ANGLE
      // We want to find the rotation that is closest to the current rotation
      const currentRotation = currentRotationRef.current;
      let targetRotation = SELECTION_ANGLE - itemAngle;

      // Normalize target to be closest to current
      const diff = targetRotation - currentRotation;
      const turns = Math.round(diff / 360);
      targetRotation = targetRotation - (turns * 360);

      // Only rotate if significant difference (avoid micro-jitters or loops if already there)
      if (Math.abs(targetRotation - currentRotation) > 0.1) {
        rotateTo(targetRotation);
      }
    }
  }, [activeId, items, rotateTo]);

  // Snap to the nearest item based on current rotation
  const snapToNearest = useCallback(() => {
    const currentRotation = currentRotationRef.current;
    const bestIndex = getClosestItemIndex(currentRotation);

    // Ensure selection is updated
    if (items[bestIndex].id !== activeId) {
      onSelectRef.current(items[bestIndex].id);
    }

    const angleStep = 360 / items.length;
    const itemAngle = bestIndex * angleStep;

    let targetRotation = SELECTION_ANGLE - itemAngle;

    // Adjust targetRotation to be closest to currentRotation to avoid wild spins
    const diff = targetRotation - currentRotation;
    const turns = Math.round(diff / 360);
    targetRotation = targetRotation - (turns * 360);

    rotateTo(targetRotation);
  }, [items, activeId, getClosestItemIndex, rotateTo]);

  // Inertia animation loop
  const startInertia = useCallback(() => {
    let velocity = velocityRef.current * 16; // Convert to per-frame (approx)

    // Cap max velocity
    if (velocity > 40) velocity = 40;
    if (velocity < -40) velocity = -40;

    const friction = 0.95;

    const animate = () => {
      velocity *= friction;

      if (Math.abs(velocity) < 0.1) {
        snapToNearest();
        return;
      }

      setRotation(prev => {
        const next = prev + velocity;
        currentRotationRef.current = next;
        if (onRotationChange) onRotationChange(next, false);

        // Update selection while spinning
        const closestIndex = getClosestItemIndex(next);
        // We use onSelectRef to avoid dependency issues in the loop
        onSelectRef.current(items[closestIndex].id);

        return next;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(animate);

  }, [onRotationChange, snapToNearest, getClosestItemIndex, items]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    // We only prevent default if touching the disc, not other elements
    // but here we are on the disc container
    // e.preventDefault(); 

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (discRef.current) {
      const rect = discRef.current.getBoundingClientRect();
      centerRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

      const angle = getAngle(clientX, clientY);
      lastAngleRef.current = angle;
      lastTimeRef.current = Date.now();
      velocityRef.current = 0;

      dragStartRef.current = { x: clientX, y: clientY, time: Date.now() };
    }

    setIsDragging(true);
    if (onRotationChange) onRotationChange(rotation, true);
  };

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;

    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;

    const currentAngle = getAngle(clientX, clientY);
    let delta = currentAngle - lastAngleRef.current;

    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    const now = Date.now();
    const dt = now - lastTimeRef.current;
    if (dt > 0) {
      velocityRef.current = delta / dt;
    }
    lastTimeRef.current = now;

    setRotation((prev) => {
      const newRot = prev + delta;
      currentRotationRef.current = newRot;
      if (onRotationChange) onRotationChange(newRot, true);

      const closestIndex = getClosestItemIndex(newRot);
      if (items[closestIndex].id !== activeId) {
        onSelect(items[closestIndex].id);
      }

      return newRot;
    });
    lastAngleRef.current = currentAngle;
  }, [isDragging, onRotationChange, getClosestItemIndex, items, activeId, onSelect]);

  const handleMouseUp = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    const clientX = 'touches' in e ? (e as TouchEvent).changedTouches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as TouchEvent).changedTouches[0].clientY : (e as MouseEvent).clientY;

    let isClick = false;
    if (dragStartRef.current) {
      const dx = clientX - dragStartRef.current.x;
      const dy = clientY - dragStartRef.current.y;
      const dt = Date.now() - dragStartRef.current.time;
      if (Math.sqrt(dx * dx + dy * dy) < 5 && dt < 200) {
        isClick = true;
      }
    }

    if (isClick) {
      // --- TAP ON DISC BODY ---
      const clickAngle = getAngle(clientX, clientY);
      const itemCount = items.length;
      const angleStep = 360 / itemCount;

      let bestIndex = 0;
      let minDiff = Infinity;

      items.forEach((_, index) => {
        const currentItemAngle = normalizeAngle((index * angleStep) + rotation);
        let diff = Math.abs(currentItemAngle - normalizeAngle(clickAngle));
        if (diff > 180) diff = 360 - diff;

        if (diff < minDiff) {
          minDiff = diff;
          bestIndex = index;
        }
      });

      const itemAngle = bestIndex * angleStep;
      const targetRotation = SELECTION_ANGLE - itemAngle;

      onSelect(items[bestIndex].id);
      rotateTo(targetRotation);

    } else {
      // --- END OF DRAG ---
      // Check if we should use inertia
      const now = Date.now();
      const timeSinceLastMove = now - lastTimeRef.current;

      // Only trigger inertia if velocity is significant and recent
      if (timeSinceLastMove < 100 && Math.abs(velocityRef.current) > 0.05) {
        startInertia();
      } else {
        snapToNearest();
      }
    }
  }, [isDragging, rotation, items, activeId, onSelect, getClosestItemIndex, rotateTo, startInertia, snapToNearest]);

  // Global listeners for drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);


  // Helper styles based on theme
  const getThemeStyles = () => {
    switch (themeMode) {
      case 'DOODLE':
        return {
          discBorder: 'border-white border-dashed',
          discBg: 'bg-[#1e1e1e]',
          centerBg: 'bg-transparent',
          centerBorder: 'border-white border-2 border-dashed',
          centerText: 'font-doodle md:text-xl text-lg tracking-normal',
          shadow: 'shadow-none',
          activeItem: 'ring-2 ring-white ring-offset-2 ring-offset-black',
        };
      case 'CONSOLE':
        return {
          discBorder: 'border-black border-4',
          discBg: 'bg-white',
          centerBg: 'bg-black',
          centerBorder: 'border-white',
          centerText: 'font-console text-white md:text-lg text-base',
          shadow: 'shadow-none',
          activeItem: 'shadow-[0_0_15px_black]',
        };
      default:
        return {
          discBorder: 'border-kraken-primary',
          discBg: 'bg-kraken-card',
          centerBg: 'bg-kraken-dark',
          centerBorder: 'border-kraken-accent',
          centerText: 'text-[8px] md:text-[10px] tracking-widest',
          shadow: 'shadow-[0_0_50px_rgba(59,130,246,0.3)]',
          activeItem: 'shadow-[0_0_15px_rgba(59,130,246,0.8)]',
        };
    }
  };
  const themeStyles = getThemeStyles();

  return (
    <div className="absolute top-0 left-0 z-30 select-none pointer-events-none">
      {/* 
         Quarter Circle Positioning Responsive: 
         Mobile: Smaller wheel (200px) with smaller offset (-60px)
         Desktop: Larger wheel (350px) with larger offset (-100px)
      */}
      <div
        className={`
          relative pointer-events-auto -translate-x-1/2 -translate-y-1/2 
          w-[240px] h-[240px] top-[-30px] left-[-30px]
          md:w-[350px] md:h-[350px] md:top-0 md:left-0
        `}
        style={{ aspectRatio: '1 / 1' }}
      >
        {/* Selector Line Indicator */}
        <div
          className="absolute top-1/2 left-1/2 w-[120px] md:w-[200px] h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none z-0"
          style={{
            transformOrigin: 'left center',
            transform: `rotate(${SELECTION_ANGLE}deg)`
          }}
        >
          <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${themeMode === 'CONSOLE' ? 'bg-black' : 'bg-white shadow-[0_0_10px_white]'}`}></div>
        </div>

        {/* The Rotating Disc Body */}
        <div
          ref={discRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          className={`
            w-full h-full rounded-full 
            border-4 
            cursor-grab active:cursor-grabbing
            flex items-center justify-center
            relative
            ${themeStyles.discBorder}
            ${themeStyles.discBg}
            ${themeStyles.shadow}
            ${!isDragging ? 'transition-shadow duration-500' : ''}
            ${isDragging ? 'shadow-[0_0_80px_rgba(59,130,246,0.6)]' : ''}
          `}
          style={{
            transform: `rotate(${rotation}deg)`,
            willChange: 'transform',
            backgroundBlendMode: 'overlay'
          }}
        >
          {/* Theme Specific Inner Details */}
          {themeMode === 'DEFAULT' && (
            <>
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.2),transparent),radial-gradient(circle_at_70%_70%,rgba(234,179,8,0.1),transparent)]"></div>
              <div className="absolute inset-4 rounded-full border border-gray-700 opacity-30 pointer-events-none"></div>
              <div className="absolute inset-12 rounded-full border border-gray-700 opacity-30 pointer-events-none"></div>
              <div className="absolute inset-20 rounded-full border border-gray-700 opacity-30 pointer-events-none"></div>
            </>
          )}
          {themeMode === 'DOODLE' && (
            <div className="absolute inset-4 border-2 border-dashed border-gray-600 rounded-full opacity-50"></div>
          )}
          {themeMode === 'CONSOLE' && (
            <div className="absolute inset-4 border border-black rounded-full opacity-20 bg-[radial-gradient(circle,rgba(0,0,0,0.05),transparent)]"></div>
          )}

          {/* Navigation Items */}
          {items.map((item, index) => {
            const itemCount = items.length;
            const angleStep = 360 / itemCount;
            const angle = index * angleStep;

            // Opacity calculation based on distance from SELECTION_ANGLE
            const globalAngle = normalizeAngle(angle + rotation);
            let diff = Math.abs(globalAngle - SELECTION_ANGLE);
            if (diff > 180) diff = 360 - diff;
            const opacity = Math.max(0.2, 1 - (diff / 120));

            return (
              <div
                key={item.id}
                className="absolute top-0 left-0 w-full h-full pointer-events-none transition-opacity duration-75"
                style={{
                  transform: `rotate(${angle}deg)`,
                  opacity: opacity
                }}
              >
                {/* Item Container */}
                <div
                  className="absolute top-3 md:top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 group pointer-events-auto cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    const targetRotation = SELECTION_ANGLE - (index * angleStep);
                    onSelect(item.id);
                    rotateTo(targetRotation);
                  }}
                >
                  {/* Icon/Dot */}
                  <div
                    className={`
                      w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center
                      transition-all duration-200
                      ${activeId === item.id
                        ? `${themeMode === 'DEFAULT' ? 'bg-kraken-primary text-white scale-125' : ''} ${themeMode === 'DOODLE' ? 'bg-white text-black scale-110 border-2 border-black' : ''} ${themeMode === 'CONSOLE' ? 'bg-black text-white scale-110' : ''} ${themeStyles.activeItem}`
                        : `${themeMode === 'CONSOLE' ? 'text-black bg-white border border-black' : 'bg-kraken-dark/80 text-gray-400 hover:bg-gray-700 hover:text-white'}`}
                    `}
                    style={{
                      transform: `rotate(${-rotation - angle}deg)`
                    }}
                  >
                    {/* Clone icon with responsive size */}
                    {React.cloneElement(item.icon as React.ReactElement<{ size?: number | string }>, { size: window.innerWidth < 768 ? 16 : 20 })}
                  </div>

                  {/* Text Label */}
                  <span
                    className={`
                      text-[10px] md:text-xs font-bold uppercase
                      transition-colors duration-200
                      ${activeId === item.id ? (themeMode === 'CONSOLE' ? 'text-black' : 'text-kraken-accent') : (themeMode === 'CONSOLE' ? 'text-gray-400' : 'text-gray-500')}
                      ${themeMode === 'DOODLE' ? 'font-doodle md:text-lg text-sm lowercase' : ''}
                      ${themeMode === 'CONSOLE' ? 'font-console md:text-sm text-xs' : ''}
                    `}
                    style={{
                      textShadow: themeMode === 'DEFAULT' ? '0 2px 4px rgba(0,0,0,0.8)' : 'none',
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center Hub */}
        <div
          className={`
                absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                w-16 h-16 md:w-20 md:h-20 rounded-full z-20 
                flex items-center justify-center shadow-lg
                cursor-pointer
                transition-transform duration-100 ease-in-out
                ${themeStyles.centerBg}
                ${themeStyles.centerBorder}
                ${isCenterPressed ? 'scale-90' : 'scale-100 hover:scale-105'}
            `}
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsCenterPressed(true);
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            setIsCenterPressed(false);
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (onCenterClick) onCenterClick();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            setIsCenterPressed(true);
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            setIsCenterPressed(false);
            if (onCenterClick) onCenterClick();
          }}
        >
          <span className={`font-bold text-center leading-tight select-none whitespace-pre-wrap px-1 ${themeStyles.centerText}`}>
            KRACKED{'\n'}DEV{'\n'}OS
          </span>
        </div>
      </div>
    </div>
  );
};

export default CircularNav;