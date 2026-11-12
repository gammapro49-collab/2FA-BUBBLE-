import React, { useState, useRef, useEffect } from 'react';
import { Shield } from 'lucide-react';

interface FloatingBubbleProps {
  containerWidth: number;
  containerHeight: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  childrenWhenExpanded?: React.ReactNode;
}

export const FloatingBubble: React.FC<FloatingBubbleProps> = ({
  containerWidth,
  containerHeight,
  isExpanded,
  onToggleExpand,
  childrenWhenExpanded,
}) => {
  const bubbleSize = 56;
  const padding = 12;

  // Position state (starts snapped to right edge at y = 140)
  const [position, setPosition] = useState({
    x: containerWidth - bubbleSize - padding,
    y: 180,
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
    hasMoved: false,
  });

  // Keep within bounds if container changes size
  useEffect(() => {
    setPosition((prev) => {
      const maxX = Math.max(0, containerWidth - bubbleSize - padding);
      const maxY = Math.max(0, containerHeight - bubbleSize - 60);
      const isLeft = prev.x < containerWidth / 2;
      return {
        x: isLeft ? padding : maxX,
        y: Math.min(Math.max(60, prev.y), maxY),
      };
    });
  }, [containerWidth, containerHeight]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isExpanded) return; // Don't drag while expanded
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: position.x,
      origY: position.y,
      hasMoved: false,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      dragRef.current.hasMoved = true;
    }

    const maxX = containerWidth - bubbleSize - padding;
    const maxY = containerHeight - bubbleSize - 70;

    const newX = Math.min(Math.max(padding, dragRef.current.origX + deltaX), maxX);
    const newY = Math.min(Math.max(60, dragRef.current.origY + deltaY), maxY);

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if capture already released
    }

    if (!dragRef.current.hasMoved) {
      // It was a tap!
      onToggleExpand();
    } else {
      // Snap to nearest edge!
      const snapThreshold = containerWidth / 2;
      const targetX = position.x < snapThreshold ? padding : containerWidth - bubbleSize - padding;
      setPosition((prev) => ({ ...prev, x: targetX }));
    }
  };

  // Compute card positioning so it doesn't overflow the phone container
  const isLeftSide = position.x < containerWidth / 2;
  const cardLeft = isLeftSide
    ? Math.min(position.x, containerWidth - 320)
    : Math.max(10, position.x + bubbleSize - 305);
  const cardTop = Math.min(Math.max(70, position.y - 10), containerHeight - 480);

  return (
    <>
      {/* Dimmed backdrop when expanded */}
      {isExpanded && (
        <div
          onClick={onToggleExpand}
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity animate-in fade-in duration-200"
        />
      )}

      {/* Expanded Floating Card Window */}
      {isExpanded && childrenWhenExpanded && (
        <div
          className="absolute z-50 transition-all duration-300"
          style={{
            left: `${cardLeft}px`,
            top: `${cardTop}px`,
          }}
        >
          {childrenWhenExpanded}
        </div>
      )}

      {/* Draggable 56dp Floating Bubble */}
      {!isExpanded && (
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: `${bubbleSize}px`,
            height: `${bubbleSize}px`,
          }}
          className={`absolute z-50 rounded-full cursor-grab active:cursor-grabbing select-none flex items-center justify-center transition-all ${
            isDragging
              ? 'scale-110 shadow-2xl shadow-indigo-500/50 ring-4 ring-indigo-400/40 duration-75'
              : 'shadow-xl shadow-indigo-600/40 hover:scale-105 duration-200 ring-2 ring-white/20'
          } bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500`}
          title="Floating 2FA (Drag anywhere • Tap to open)"
        >
          {/* Subtle pulse ring */}
          <span className="absolute -inset-1 rounded-full bg-indigo-500/20 animate-pulse pointer-events-none" />

          {/* Shield / Lock Icon */}
          <Shield className="w-6 h-6 text-white drop-shadow-md pointer-events-none" />

          {/* Active 2FA status mini indicator */}
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 pointer-events-none shadow" />
        </div>
      )}
    </>
  );
};
