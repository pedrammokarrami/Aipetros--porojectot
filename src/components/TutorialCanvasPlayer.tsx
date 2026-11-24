import { useEffect, useRef } from 'react';
import type { AmbientColorRGB } from '../utils/media';
import {
  BUILT_IN_TUTORIALS,
  getChapterStateAtTime,
  type BuiltInTutorial,
} from '../utils/tutorials';

interface TutorialCanvasPlayerProps {
  demoId: BuiltInTutorial['id'];
  isPlaying: boolean;
  currentTime: number;
  playbackRate: number;
  onTimeUpdate: (nextTime: number) => void;
  onDurationReady: (duration: number) => void;
  onEnded: () => void;
  onAmbientColorChange: (rgb: AmbientColorRGB) => void;
}

const CANVAS_W = 1920;
const CANVAS_H = 1080;
const BACKING_W = 1280;
const BACKING_H = 720;
const CANVAS_SCALE = BACKING_W / CANVAS_W;

function drawProjectedSlideBackdrop(
  ctx: CanvasRenderingContext2D,
  accentRgb: AmbientColorRGB
) {
  // Bright, crisp projected keynote surface simulating a high-lumen laser projector on matte #e5e7eb screen
  const bg = ctx.createRadialGradient(
    CANVAS_W * 0.5,
    CANVAS_H * 0.42,
    80,
    CANVAS_W * 0.5,
    CANVAS_H * 0.48,
    1180
  );
  bg.addColorStop(0, '#fbfcfe');
  bg.addColorStop(0.55, '#eef2f7');
  bg.addColorStop(1, '#dfe5ee');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Subtle warm-tinted projector luminance wash in center
  const bloom = ctx.createRadialGradient(
    CANVAS_W * 0.5,
    CANVAS_H * 0.44,
    20,
    CANVAS_W * 0.5,
    CANVAS_H * 0.44,
    720
  );
  bloom.addColorStop(0, `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.08)`);
  bloom.addColorStop(0.6, 'rgba(255, 250, 240, 0.04)');
  bloom.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Crisp precision drafting grid
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.055)';
  ctx.lineWidth = 1;
  const step = 64;
  ctx.beginPath();
  for (let x = step; x < CANVAS_W; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CANVAS_H);
  }
  for (let y = step; y < CANVAS_H; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_W, y);
  }
  ctx.stroke();
}

function drawSuperpositionScene(
  ctx: CanvasRenderingContext2D,
  time: number,
  progress: number
) {
  const left = 130;
  const width = 1100;
  const midY1 = 355;
  const midY2 = 520;
  const midY3 = 705;

  const phasePhi = Math.sin(progress * Math.PI * 2.5) * Math.PI;
  const omegaT = time * 2.4;

  // Baseline axes
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.14)';
  ctx.lineWidth = 1.6;
  [midY1, midY2, midY3].forEach((y) => {
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(left + width, y);
    ctx.stroke();
  });

  // Crisp high-contrast axis labels
  ctx.font = '500 22px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#0369a1';
  ctx.fillText('E₁(x,t)', left, midY1 - 54);

  ctx.fillStyle = '#b45309';
  ctx.fillText(`E₂(x,t + φ)   φ = ${(phasePhi / Math.PI).toFixed(2)}π`, left, midY2 - 54);

  ctx.fillStyle = '#0f172a';
  ctx.fillText('E₁ + E₂  (Resultant Field)', left, midY3 - 78);

  const drawWave = (
    centerY: number,
    amp: number,
    strokeStyle: string,
    lineWidth: number,
    fn: (xNorm: number) => number
  ) => {
    ctx.beginPath();
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    for (let i = 0; i <= 260; i++) {
      const xNorm = i / 260;
      const x = left + xNorm * width;
      const y = centerY - fn(xNorm) * amp;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  drawWave(midY1, 46, '#0284c7', 4, (u) => Math.cos(u * Math.PI * 6 - omegaT));
  drawWave(midY2, 46, '#d97706', 4, (u) => Math.cos(u * Math.PI * 6 - omegaT + phasePhi));
  drawWave(
    midY3,
    48,
    '#0f172a',
    5.5,
    (u) => Math.cos(u * Math.PI * 6 - omegaT) + Math.cos(u * Math.PI * 6 - omegaT + phasePhi)
  );

  // Right-side Phasor Diagram
  const cx = 1545;
  const cy = 530;
  const r = 136;

  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.35, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.16)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - r * 1.45, cy);
  ctx.lineTo(cx + r * 1.45, cy);
  ctx.moveTo(cx, cy - r * 1.45);
  ctx.lineTo(cx, cy + r * 1.45);
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)';
  ctx.stroke();

  const a1 = -omegaT * 0.45;
  const a2 = a1 + phasePhi;
  const x1 = cx + Math.cos(a1) * r;
  const y1 = cy + Math.sin(a1) * r;
  const x2 = x1 + Math.cos(a2) * r;
  const y2 = y1 + Math.sin(a2) * r;

  // Vector E1
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 4.5;
  ctx.stroke();

  // Vector E2 tip-to-tail
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 4.5;
  ctx.stroke();

  // Resultant vector
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 5.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x2, y2, 7.5, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();

  const ampRatio = Math.abs(2 * Math.cos(phasePhi / 2));
  ctx.font = '500 20px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#475569';
  ctx.textAlign = 'center';
  ctx.fillText('PHASOR SUM', cx, cy - r * 1.56);
  ctx.fillStyle = ampRatio > 1.2 ? '#0369a1' : ampRatio < 0.4 ? '#b45309' : '#0f172a';
  ctx.fillText(`|E_total| = ${ampRatio.toFixed(2)} · E₀`, cx, cy + r * 1.66);
  ctx.textAlign = 'left';
}

function drawDoubleSlitScene(ctx: CanvasRenderingContext2D, time: number) {
  const barrierX = 480;
  const screenX = 1410;
  const midY = 530;
  const slitOffset = 88;
  const slit1Y = midY - slitOffset;
  const slit2Y = midY + slitOffset;

  // Incident plane waves on the left
  ctx.strokeStyle = 'rgba(2, 132, 199, 0.45)';
  ctx.lineWidth = 3;
  const wavelength = 54;
  const shift = (time * 58) % wavelength;
  for (let x = 160 + shift; x < barrierX - 18; x += wavelength) {
    ctx.beginPath();
    ctx.moveTo(x, midY - 220);
    ctx.lineTo(x, midY + 220);
    ctx.stroke();
  }

  // Circular coherent wavefronts from S1 & S2
  ctx.save();
  ctx.beginPath();
  ctx.rect(barrierX, midY - 265, screenX - barrierX, 530);
  ctx.clip();

  const maxR = 1040;
  for (let r = shift; r < maxR; r += wavelength) {
    const fade = Math.max(0.08, 1 - r / maxR);
    ctx.strokeStyle = `rgba(2, 132, 199, ${(fade * 0.46).toFixed(3)})`;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(barrierX, slit1Y, r, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    ctx.strokeStyle = `rgba(13, 148, 136, ${(fade * 0.46).toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(barrierX, slit2Y, r, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  }
  ctx.restore();

  // Slit barrier wall
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(barrierX - 8, midY - 260, 16, slit1Y - (midY - 260) - 18);
  ctx.fillRect(barrierX - 8, slit1Y + 18, 16, slit2Y - slit1Y - 36);
  ctx.fillRect(barrierX - 8, slit2Y + 18, 16, midY + 260 - (slit2Y + 18));

  ctx.font = '600 22px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('S₁', barrierX - 50, slit1Y + 7);
  ctx.fillText('S₂', barrierX - 50, slit2Y + 7);

  // Observation screen + intensity curve
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(screenX - 6, midY - 260, 12, 520);

  for (let dy = -250; dy <= 250; dy += 4) {
    const theta = dy / 930;
    const phase = (Math.PI * 176 * theta) / 54;
    const envelope = Math.exp(-(dy * dy) / (2 * 165 * 165));
    const intensity = Math.pow(Math.cos(phase * 3.1), 2) * envelope;
    ctx.fillStyle = `rgba(2, 132, 199, ${(intensity * 0.95).toFixed(3)})`;
    ctx.fillRect(screenX - 6, midY + dy, 12, 4);
  }

  ctx.beginPath();
  ctx.strokeStyle = '#0369a1';
  ctx.lineWidth = 4;
  for (let dy = -250; dy <= 250; dy += 3) {
    const theta = dy / 930;
    const phase = (Math.PI * 176 * theta) / 54;
    const envelope = Math.exp(-(dy * dy) / (2 * 165 * 165));
    const intensity = Math.pow(Math.cos(phase * 3.1), 2) * envelope;
    const px = screenX + 26 + intensity * 265;
    const py = midY + dy;
    if (dy === -250) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  ctx.font = '600 20px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#334155';
  ctx.fillText('INTENSITY I(θ)', screenX + 46, midY - 230);
}

function drawThinFilmScene(ctx: CanvasRenderingContext2D, time: number) {
  const topY = 455;
  const filmThickness = 135;
  const botY = topY + filmThickness;

  ctx.font = '500 22px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#475569';
  ctx.fillText('Air  (n₀ = 1.00)', 155, topY - 40);

  ctx.fillStyle = 'rgba(217, 119, 6, 0.14)';
  ctx.fillRect(140, topY, 1640, filmThickness);
  ctx.strokeStyle = 'rgba(180, 83, 9, 0.45)';
  ctx.lineWidth = 2;
  ctx.strokeRect(140, topY, 1640, filmThickness);

  ctx.fillStyle = '#92400e';
  ctx.fillText('MgF₂ Optical Coating  (n₁ = 1.38,  t = λ / 4n₁)', 155, topY + 75);

  ctx.fillStyle = 'rgba(2, 132, 199, 0.1)';
  ctx.fillRect(140, botY, 1640, 175);
  ctx.strokeStyle = 'rgba(3, 105, 161, 0.32)';
  ctx.strokeRect(140, botY, 1640, 175);
  ctx.fillStyle = '#075985';
  ctx.fillText('Projector Lens Glass  (n₂ = 1.52)', 155, botY + 95);

  const hit1X = 860;
  const hit2X = 955;
  const exitX = 1050;

  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(640, 275);
  ctx.lineTo(hit1X, topY);
  ctx.stroke();

  ctx.strokeStyle = '#b45309';
  ctx.beginPath();
  ctx.moveTo(hit1X, topY);
  ctx.lineTo(1090, 275);
  ctx.stroke();

  ctx.strokeStyle = '#0284c7';
  ctx.beginPath();
  ctx.moveTo(hit1X, topY);
  ctx.lineTo(hit2X, botY);
  ctx.lineTo(exitX, topY);
  ctx.stroke();

  ctx.strokeStyle = '#0369a1';
  ctx.beginPath();
  ctx.moveTo(exitX, topY);
  ctx.lineTo(1280, 275);
  ctx.stroke();

  const pulse = (time * 0.55) % 1;
  const drawDot = (x0: number, y0: number, x1: number, y1: number, t: number, color: string) => {
    const px = x0 + (x1 - x0) * t;
    const py = y0 + (y1 - y0) * t;
    ctx.beginPath();
    ctx.arc(px, py, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  };

  drawDot(640, 275, hit1X, topY, pulse, '#f59e0b');
  drawDot(hit1X, topY, 1090, 275, pulse, '#b45309');
  drawDot(exitX, topY, 1280, 275, (pulse + 0.5) % 1, '#0284c7');

  ctx.fillStyle = '#92400e';
  ctx.fillText('R₁ (π phase shift)', 1108, 290);
  ctx.fillStyle = '#0369a1';
  ctx.fillText('R₂ (Δφ = π → Destructive Cancellation)', 1295, 290);
}

function drawFraunhoferScene(ctx: CanvasRenderingContext2D, time: number) {
  const left = 180;
  const width = 1560;
  const baseY = 735;
  const peakH = 395;
  const ratio = 4.5 + Math.sin(time * 0.7) * 1.1;

  ctx.strokeStyle = 'rgba(15, 23, 42, 0.28)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(left, baseY);
  ctx.lineTo(left + width, baseY);
  ctx.moveTo(left + width / 2, baseY + 18);
  ctx.lineTo(left + width / 2, baseY - peakH - 35);
  ctx.stroke();

  ctx.save();
  ctx.setLineDash([10, 8]);
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 400; i++) {
    const u = (i / 400 - 0.5) * 2;
    const beta = u * Math.PI * 2.6;
    const sinc = Math.abs(beta) < 0.001 ? 1 : Math.sin(beta) / beta;
    const env = sinc * sinc;
    const x = left + (i / 400) * width;
    const y = baseY - env * peakH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();

  ctx.beginPath();
  ctx.moveTo(left, baseY);
  for (let i = 0; i <= 520; i++) {
    const u = (i / 520 - 0.5) * 2;
    const beta = u * Math.PI * 2.6;
    const sinc = Math.abs(beta) < 0.001 ? 1 : Math.sin(beta) / beta;
    const alpha = beta * ratio;
    const intensity = sinc * sinc * Math.cos(alpha) * Math.cos(alpha);
    const x = left + (i / 520) * width;
    const y = baseY - intensity * peakH;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(left + width, baseY);
  ctx.closePath();

  const fillGrad = ctx.createLinearGradient(0, baseY - peakH, 0, baseY);
  fillGrad.addColorStop(0, 'rgba(3, 105, 161, 0.34)');
  fillGrad.addColorStop(1, 'rgba(3, 105, 161, 0.04)');
  ctx.fillStyle = fillGrad;
  ctx.fill();

  ctx.strokeStyle = '#0369a1';
  ctx.lineWidth = 3.8;
  ctx.stroke();

  ctx.font = '600 22px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#b45309';
  ctx.fillText('Single-Slit Diffraction Envelope [sin(β)/β]²', left + 30, baseY - peakH + 10);
  ctx.fillStyle = '#0f172a';
  ctx.fillText(`d / a ratio = ${ratio.toFixed(2)}`, left + width - 290, baseY - peakH + 10);
}

function drawConsensusScene(
  ctx: CanvasRenderingContext2D,
  chapterIndex: number,
  time: number
) {
  const cx = 610;
  const cy = 535;
  const radius = 212;
  const nodeNames = ['Node A', 'Node B', 'Node C', 'Node D', 'Node E'];
  const nodes = nodeNames.map((name, i) => {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    return {
      name,
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      isLeader: i === 0,
      inQuorum: i === 0 || i === 1 || i === 4,
    };
  });

  ctx.beginPath();
  ctx.arc(cx, cy - 35, 276, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(5, 150, 105, 0.07)';
  ctx.fill();
  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = 'rgba(5, 150, 105, 0.45)';
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.setLineDash([]);

  const packetT = (time * 0.75) % 1;
  nodes.forEach((node, idx) => {
    if (idx === 0) return;
    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y);
    ctx.lineTo(node.x, node.y);
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.2)';
    ctx.lineWidth = 2.6;
    ctx.stroke();

    const px = nodes[0].x + (node.x - nodes[0].x) * packetT;
    const py = nodes[0].y + (node.y - nodes[0].y) * packetT;
    ctx.beginPath();
    ctx.arc(px, py, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = chapterIndex === 2 ? '#d97706' : '#059669';
    ctx.fill();
  });

  nodes.forEach((node) => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 44, 0, Math.PI * 2);
    ctx.fillStyle = node.isLeader ? '#e0f2fe' : '#ffffff';
    ctx.fill();
    ctx.strokeStyle = node.isLeader
      ? '#0284c7'
      : node.inQuorum
      ? '#059669'
      : '#94a3b8';
    ctx.lineWidth = node.isLeader ? 4.2 : 2.8;
    ctx.stroke();

    ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText(node.name, node.x, node.y + 6);
    if (node.isLeader) {
      ctx.font = '600 15px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#0369a1';
      ctx.fillText('LEADER', node.x, node.y - 58);
    }
  });
  ctx.textAlign = 'left';

  const logX = 1035;
  const logY = 345;
  ctx.font = '600 22px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#1e293b';
  ctx.fillText('REPLICATED LOG STATE (TERM 4)', logX, logY - 26);

  const entries = ['SET x=4', 'ADD y=2', 'CAS k=9', 'PUT z=1', 'ACK #48'];
  const committed = Math.min(entries.length, 2 + Math.floor((time * 0.4) % 4));

  nodeNames.forEach((name, row) => {
    const ry = logY + row * 72;
    ctx.font = '500 19px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#475569';
    ctx.fillText(name, logX, ry + 34);

    entries.forEach((cmd, col) => {
      const cxBox = logX + 105 + col * 126;
      const isPresent = col < committed || (row < 3 && col === committed);
      ctx.fillStyle = isPresent
        ? col < committed
          ? 'rgba(5, 150, 105, 0.14)'
          : 'rgba(2, 132, 199, 0.14)'
        : 'rgba(255, 255, 255, 0.72)';
      ctx.strokeStyle = isPresent
        ? col < committed
          ? '#059669'
          : '#0284c7'
        : '#cbd5e1';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.roundRect(cxBox, ry, 114, 52, 8);
      ctx.fill();
      ctx.stroke();

      ctx.font = '600 16px "IBM Plex Mono", monospace';
      ctx.fillStyle = isPresent ? '#0f172a' : '#94a3b8';
      ctx.fillText(isPresent ? cmd : '—', cxBox + 14, ry + 32);
    });
  });
}

function renderTutorialFrame(
  ctx: CanvasRenderingContext2D,
  tutorial: BuiltInTutorial,
  time: number
) {
  ctx.save();
  ctx.setTransform(CANVAS_SCALE, 0, 0, CANVAS_SCALE, 0, 0);
  const { chapter, chapterProgress } = getChapterStateAtTime(tutorial, time);

  drawProjectedSlideBackdrop(ctx, chapter.ambientColor);

  // Quiet editorial top metadata row
  ctx.font = '500 22px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#475569';
  ctx.fillText(`${tutorial.courseCode}   ·   ${tutorial.instructor}`, 130, 88);

  ctx.textAlign = 'right';
  ctx.fillText(`Module ${chapter.index} / ${tutorial.chapters.length}`, CANVAS_W - 130, 88);
  ctx.textAlign = 'left';

  ctx.strokeStyle = 'rgba(15, 23, 42, 0.12)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(130, 110);
  ctx.lineTo(CANVAS_W - 130, 110);
  ctx.stroke();

  // Slide primary title
  ctx.font = '700 48px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(chapter.title, 130, 184);

  // Formula readout right-aligned
  ctx.font = '500 24px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#0369a1';
  ctx.textAlign = 'right';
  ctx.fillText(chapter.keyFormula, CANVAS_W - 130, 180);
  ctx.textAlign = 'left';

  if (tutorial.id === 'wave-optics') {
    if (chapter.index === 1) {
      drawSuperpositionScene(ctx, time, chapterProgress);
    } else if (chapter.index === 2) {
      drawDoubleSlitScene(ctx, time);
    } else if (chapter.index === 3) {
      drawThinFilmScene(ctx, time);
    } else {
      drawFraunhoferScene(ctx, time);
    }
  } else {
    drawConsensusScene(ctx, chapter.index, time);
  }

  // Crisp single-line educational caption cleanly above the control dock
  ctx.font = '500 25px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText(chapter.caption, 130, 872);
  ctx.restore();
}

export function TutorialCanvasPlayer({
  demoId,
  isPlaying,
  currentTime,
  playbackRate,
  onTimeUpdate,
  onDurationReady,
  onEnded,
  onAmbientColorChange,
}: TutorialCanvasPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timeRef = useRef(currentTime);
  const lastChapterIdRef = useRef<string | null>(null);

  const tutorial = BUILT_IN_TUTORIALS[demoId];

  useEffect(() => {
    timeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    onDurationReady(tutorial.duration);
    lastChapterIdRef.current = null;
  }, [tutorial.duration, demoId, onDurationReady]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderTutorialFrame(ctx, tutorial, currentTime);

    const { chapter } = getChapterStateAtTime(tutorial, currentTime);
    if (lastChapterIdRef.current !== chapter.id) {
      lastChapterIdRef.current = chapter.id;
      // Bright neutral-warm projected screen bounce blended with slide accent
      onAmbientColorChange({
        r: Math.round(chapter.ambientColor.r * 0.4 + 148),
        g: Math.round(chapter.ambientColor.g * 0.4 + 148),
        b: Math.round(chapter.ambientColor.b * 0.4 + 142),
      });
    }
  }, [tutorial, currentTime, onAmbientColorChange]);

  useEffect(() => {
    if (!isPlaying) return;

    let rafId = 0;
    let lastTimestamp = performance.now();
    let lastDrawTime = 0;
    let lastUiSync = lastTimestamp;

    const tick = (now: number) => {
      const dtSec = Math.min(0.1, Math.max(0, (now - lastTimestamp) / 1000));
      lastTimestamp = now;

      let nextTime = timeRef.current + dtSec * playbackRate;
      if (nextTime >= tutorial.duration) {
        nextTime = tutorial.duration;
        timeRef.current = nextTime;
        onTimeUpdate(nextTime);
        onEnded();
        return;
      }

      timeRef.current = nextTime;

      if (now - lastDrawTime >= 41) {
        lastDrawTime = now;
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            renderTutorialFrame(ctx, tutorial, nextTime);
          }
        }
      }

      const { chapter } = getChapterStateAtTime(tutorial, nextTime);
      if (lastChapterIdRef.current !== chapter.id) {
        lastChapterIdRef.current = chapter.id;
        onAmbientColorChange({
          r: Math.round(chapter.ambientColor.r * 0.4 + 148),
          g: Math.round(chapter.ambientColor.g * 0.4 + 148),
          b: Math.round(chapter.ambientColor.b * 0.4 + 142),
        });
      }

      if (now - lastUiSync >= 200) {
        lastUiSync = now;
        onTimeUpdate(nextTime);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, playbackRate, tutorial, onTimeUpdate, onEnded, onAmbientColorChange]);

  return (
    <canvas
      ref={canvasRef}
      width={BACKING_W}
      height={BACKING_H}
      data-testid="tutorial-canvas"
      className="block h-full w-full"
    />
  );
}
