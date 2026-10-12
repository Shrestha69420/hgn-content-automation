import React, { useEffect, useRef } from 'react';
import { SLIDE_W, SLIDE_H, type BrandColors, type Slide, type TextLayer } from '../../types';
import { drawSlide, layerBox } from '../../lib/slideRenderer';

interface Props {
  slide: Slide;
  colors: BrandColors;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (layerId: string, x: number, y: number) => void;
  width?: number;
}

/** Editable slide preview: click a text layer to select it, drag to move it. */
export const SlideCanvas: React.FC<Props> = ({ slide, colors, selectedId, onSelect, onMove, width = 420 }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);

  useEffect(() => {
    let alive = true;
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    const paint = () => alive && drawSlide(ctx, slide, colors, { selectedId });
    paint();
    // Ubuntu may finish loading after the first paint
    document.fonts?.ready.then(() => { paint(); });
    return () => { alive = false; };
  }, [slide, colors, selectedId]);

  const toSlide = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * SLIDE_W, y: ((e.clientY - r.top) / r.height) * SLIDE_H };
  };

  const hit = (x: number, y: number): TextLayer | undefined => {
    const ctx = ref.current!.getContext('2d')!;
    return [...slide.layers].reverse().find(l => {
      const b = layerBox(ctx, l);
      return x >= b.x - 10 && x <= b.x + b.w + 10 && y >= b.y - 10 && y <= b.y + b.h + 10;
    });
  };

  return (
    <canvas
      ref={ref}
      width={SLIDE_W}
      height={SLIDE_H}
      style={{ width, height: (width * SLIDE_H) / SLIDE_W, touchAction: 'none' }}
      className="rounded-lg border border-zinc-800 cursor-move bg-deep max-w-full"
      onPointerDown={e => {
        const p = toSlide(e);
        const l = hit(p.x, p.y);
        onSelect(l?.id ?? null);
        if (l) {
          drag.current = { id: l.id, dx: p.x - l.x, dy: p.y - l.y };
          (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
        }
      }}
      onPointerMove={e => {
        if (!drag.current) return;
        const p = toSlide(e);
        onMove(drag.current.id, Math.round(p.x - drag.current.dx), Math.round(p.y - drag.current.dy));
      }}
      onPointerUp={() => (drag.current = null)}
    />
  );
};

export const SlideThumb: React.FC<{ slide: Slide; colors: BrandColors; width?: number }> = ({ slide, colors, width = 64 }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (ctx) drawSlide(ctx, slide, colors);
  }, [slide, colors]);
  return (
    <canvas
      ref={ref}
      width={SLIDE_W}
      height={SLIDE_H}
      style={{ width, height: (width * SLIDE_H) / SLIDE_W }}
      className="rounded border border-zinc-800 bg-deep"
    />
  );
};
