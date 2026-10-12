/** One canvas renderer shared by the editor preview and the PNG export, so what you see is what ships. */
import { SLIDE_W, SLIDE_H, resolveColor, type BrandColors, type Slide, type TextLayer } from '../types';

const imageCache = new Map<string, Promise<HTMLImageElement>>();

export function loadImage(url: string): Promise<HTMLImageElement> {
  let p = imageCache.get(url);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        imageCache.delete(url);
        reject(new Error('Image failed to load'));
      };
      img.src = url;
    });
    imageCache.set(url, p);
  }
  return p;
}

const FONT = {
  sans: '"Ubuntu", system-ui, -apple-system, "Segoe UI", sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
};
const fontOf = (l: TextLayer) => `${l.weight} ${l.size}px ${FONT[l.font]}`;

export function layoutLayer(ctx: CanvasRenderingContext2D, l: TextLayer) {
  ctx.font = fontOf(l);
  const lines: string[] = [];
  for (const para of l.text.split('\n')) {
    let line = '';
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > l.width) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    lines.push(line);
  }
  const lineH = l.size * 1.2;
  return { lines, lineH, height: Math.max(lines.length, 1) * lineH };
}

export function layerBox(ctx: CanvasRenderingContext2D, l: TextLayer) {
  return { x: l.x, y: l.y, w: l.width, h: layoutLayer(ctx, l).height };
}

export async function drawSlide(
  ctx: CanvasRenderingContext2D,
  slide: Slide,
  colors: BrandColors,
  opts: { selectedId?: string | null } = {}
) {
  ctx.clearRect(0, 0, SLIDE_W, SLIDE_H);
  ctx.fillStyle = resolveColor(slide.bgColor, colors);
  ctx.fillRect(0, 0, SLIDE_W, SLIDE_H);

  if (slide.background) {
    try {
      const img = await loadImage(slide.background);
      // cover-fit
      const s = Math.max(SLIDE_W / img.width, SLIDE_H / img.height);
      const w = img.width * s;
      const h = img.height * s;
      ctx.drawImage(img, (SLIDE_W - w) / 2, (SLIDE_H - h) / 2, w, h);
    } catch {
      /* keep solid color */
    }
  }
  if (slide.overlay > 0) {
    ctx.fillStyle = `rgba(0,0,0,${slide.overlay})`;
    ctx.fillRect(0, 0, SLIDE_W, SLIDE_H);
  }

  ctx.textBaseline = 'top';
  for (const l of slide.layers) {
    const { lines, lineH } = layoutLayer(ctx, l);
    ctx.font = fontOf(l);
    ctx.fillStyle = resolveColor(l.color, colors);
    ctx.textAlign = l.align;
    if (l.shadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 3;
    }
    const ax = l.align === 'left' ? l.x : l.align === 'center' ? l.x + l.width / 2 : l.x + l.width;
    lines.forEach((line, i) => ctx.fillText(line, ax, l.y + i * lineH));
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }

  if (opts.selectedId) {
    const l = slide.layers.find(x => x.id === opts.selectedId);
    if (l) {
      const b = layerBox(ctx, l);
      ctx.save();
      ctx.strokeStyle = '#2bb5a6';
      ctx.lineWidth = 4;
      ctx.setLineDash([16, 10]);
      ctx.strokeRect(b.x - 8, b.y - 8, b.w + 16, b.h + 16);
      ctx.restore();
    }
  }
}

async function ensureFonts() {
  try {
    await Promise.all([
      document.fonts.load('400 40px "Ubuntu"'),
      document.fonts.load('700 40px "Ubuntu"'),
      document.fonts.load('900 40px "Ubuntu"'),
    ]);
  } catch {
    /* fall back to system fonts */
  }
}

export async function renderSlideToBlob(slide: Slide, colors: BrandColors): Promise<Blob> {
  await ensureFonts();
  const canvas = document.createElement('canvas');
  canvas.width = SLIDE_W;
  canvas.height = SLIDE_H;
  const ctx = canvas.getContext('2d')!;
  await drawSlide(ctx, slide, colors);
  return new Promise((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Could not render slide'))), 'image/png')
  );
}

export function downloadBlob(blob: Blob, name: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
