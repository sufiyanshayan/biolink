import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { RotateCw, X, Check } from 'lucide-react';

interface ImageCropperProps {
  src: string;
  /** 'circle' = profile picture (square output, circular mask), 'rect' = wallpaper (3:4) */
  shape: 'circle' | 'rect';
  lang: 'en' | 'bn' | string;
  onCancel: () => void;
  onDone: (dataUrl: string) => void;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * WhatsApp-style cropper:
 *  - the crop frame is fixed in the centre
 *  - the photo moves underneath it (drag with mouse/finger)
 *  - zoom by pinch, mouse wheel or the slider
 *  - rotate 90° with one tap
 *  - what you see inside the frame is exactly what gets saved
 */
export default function ImageCropper({ src, shape, lang, onCancel, onDone }: ImageCropperProps) {
  const isEn = lang === 'en';
  const aspect = shape === 'circle' ? 1 : 3 / 4; // width / height

  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [frame, setFrame] = useState({ w: 280, h: 280 });
  const [rotation, setRotation] = useState(0); // 0 / 90 / 180 / 270
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 }); // image-centre offset from frame centre (px)
  const [dragging, setDragging] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStart = useRef<{ dist: number; zoom: number } | null>(null);

  // ---- frame size (responsive) ----
  useLayoutEffect(() => {
    const update = () => {
      const maxW = Math.min(window.innerWidth - 40, 360);
      const maxH = Math.max(180, window.innerHeight - 230);
      let w = maxW;
      let h = w / aspect;
      if (h > maxH) {
        h = maxH;
        w = h * aspect;
      }
      setFrame({ w: Math.round(w), h: Math.round(h) });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [aspect]);

  // ---- geometry helpers ----
  const swapped = rotation === 90 || rotation === 270;
  const effW = nat ? (swapped ? nat.h : nat.w) : 1;
  const effH = nat ? (swapped ? nat.w : nat.h) : 1;
  // scale at which the image just covers the frame
  const baseScale = nat ? Math.max(frame.w / effW, frame.h / effH) : 1;
  const scale = baseScale * zoom;

  const clampPos = useCallback(
    (p: { x: number; y: number }, z = zoom) => {
      if (!nat) return p;
      const s = baseScale * z;
      const maxX = Math.max(0, (effW * s - frame.w) / 2);
      const maxY = Math.max(0, (effH * s - frame.h) / 2);
      return { x: clamp(p.x, -maxX, maxX), y: clamp(p.y, -maxY, maxY) };
    },
    [nat, baseScale, effW, effH, frame.w, frame.h, zoom]
  );

  // keep image covering the frame when frame size / rotation / zoom changes
  useEffect(() => {
    setPos((p) => clampPos(p));
  }, [clampPos]);

  const changeZoom = (z: number) => {
    const nz = clamp(z, 1, 5);
    setZoom(nz);
    setPos((p) => clampPos(p, nz));
  };

  const rotate = () => {
    setRotation((r) => (r + 90) % 360);
    setZoom(1);
    setPos({ x: 0, y: 0 });
  };

  // ---- pointer gestures (mouse + touch + pen) ----
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setDragging(true);
    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      pinchStart.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom };
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, cur);

    if (pointers.current.size >= 2 && pinchStart.current) {
      const [a, b] = Array.from(pointers.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchStart.current.dist > 0) {
        changeZoom(pinchStart.current.zoom * (dist / pinchStart.current.dist));
      }
      return;
    }

    const dx = cur.x - prev.x;
    const dy = cur.y - prev.y;
    setPos((p) => clampPos({ x: p.x + dx, y: p.y + dy }));
  };

  const endPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    pinchStart.current = null;
    if (pointers.current.size === 0) setDragging(false);
  };

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    changeZoom(zoom * (e.deltaY > 0 ? 0.92 : 1.08));
  };

  // ---- export exactly what is visible inside the frame ----
  const handleDone = () => {
    const img = imgRef.current;
    if (!img || !nat) return;

    const outW = shape === 'circle' ? 512 : 720;
    const outH = Math.round(outW / aspect);
    const k = outW / frame.w; // frame px -> output px

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outW, outH);
    ctx.imageSmoothingQuality = 'high';
    ctx.translate(outW / 2 + pos.x * k, outH / 2 + pos.y * k);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale * k, scale * k);
    ctx.drawImage(img, -nat.w / 2, -nat.h / 2, nat.w, nat.h);

    onDone(canvas.toDataURL('image/jpeg', 0.92));
  };

  // close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0b141a] text-white font-sans select-none">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          aria-label={isEn ? 'Cancel' : 'বাতিল'}
        >
          <X className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold tracking-wide">
          {shape === 'circle'
            ? isEn ? 'Drag to adjust' : 'ছবি সরিয়ে ঠিক করুন'
            : isEn ? 'Crop image' : 'ছবি ক্রপ করুন'}
        </span>
        <button
          type="button"
          onClick={rotate}
          className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          aria-label={isEn ? 'Rotate 90°' : 'রোটেট ৯০°'}
        >
          <RotateCw className="w-5 h-5" />
        </button>
      </div>

      {/* Stage */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <div
          className="relative overflow-visible"
          style={{
            width: frame.w,
            height: frame.h,
            touchAction: 'none',
            cursor: dragging ? 'grabbing' : 'grab'
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onWheel={onWheel}
        >
          {/* The photo (moves under the frame) */}
          <img
            ref={imgRef}
            src={src}
            alt=""
            draggable={false}
            onLoad={(e) => {
              const el = e.currentTarget;
              setNat({ w: el.naturalWidth, h: el.naturalHeight });
            }}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: nat?.w,
              height: nat?.h,
              maxWidth: 'none',
              marginLeft: nat ? -nat.w / 2 : 0,
              marginTop: nat ? -nat.h / 2 : 0,
              transformOrigin: 'center center',
              transform: `translate(${pos.x}px, ${pos.y}px) rotate(${rotation}deg) scale(${scale})`,
              transition: dragging ? 'none' : 'transform 0.18s ease-out',
              opacity: nat ? 1 : 0,
              pointerEvents: 'none',
              userSelect: 'none'
            }}
          />

          {/* Dimmed area outside the frame */}
          <div
            className={`absolute inset-0 pointer-events-none ${shape === 'circle' ? 'rounded-full' : ''}`}
            style={{ boxShadow: '0 0 0 100vmax rgba(11,20,26,0.72)' }}
          />

          {/* Frame border + grid */}
          <div
            className={`absolute inset-0 pointer-events-none border-2 border-white/90 overflow-hidden ${
              shape === 'circle' ? 'rounded-full' : 'rounded-sm'
            }`}
          >
            {dragging && (
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="border border-white/25" />
                ))}
              </div>
            )}
          </div>

          {/* Corner brackets for the rectangle shape */}
          {shape === 'rect' && (
            <>
              <div className="absolute -top-0.5 -left-0.5 w-5 h-5 border-t-4 border-l-4 border-white pointer-events-none" />
              <div className="absolute -top-0.5 -right-0.5 w-5 h-5 border-t-4 border-r-4 border-white pointer-events-none" />
              <div className="absolute -bottom-0.5 -left-0.5 w-5 h-5 border-b-4 border-l-4 border-white pointer-events-none" />
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 border-b-4 border-r-4 border-white pointer-events-none" />
            </>
          )}
        </div>
      </div>

      {/* Zoom slider */}
      <div className="flex items-center justify-center gap-3 px-6 pb-3">
        <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider">{isEn ? 'Zoom' : 'জুম'}</span>
        <input
          type="range"
          min="1"
          max="5"
          step="0.01"
          value={zoom}
          onChange={(e) => changeZoom(parseFloat(e.target.value))}
          className="w-48 accent-[#00a884] cursor-pointer"
        />
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          className="text-[#00a884] hover:text-[#00bf96] text-sm font-bold tracking-wider px-3 py-2 cursor-pointer"
        >
          {isEn ? 'Cancel' : 'বাতিল'}
        </button>
        <button
          type="button"
          onClick={handleDone}
          disabled={!nat}
          className="flex items-center gap-2 bg-[#00a884] hover:bg-[#00bf96] disabled:opacity-40 text-[#0b141a] text-sm font-bold px-5 py-2.5 rounded-full cursor-pointer transition-colors"
        >
          <Check className="w-4 h-4" />
          {isEn ? 'Done' : 'সম্পন্ন'}
        </button>
      </div>
    </div>
  );
}
