import { useState, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  Gauge,
} from 'lucide-react';
import { formatTimecode, PLAYBACK_SPEEDS } from '../utils/media';
import type { TutorialChapter } from '../utils/tutorials';

interface VisionControlsProps {
  visible: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isFullscreen: boolean;
  title: string;
  chapters?: TutorialChapter[];
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onPlaybackRateChange: (rate: number) => void;
  onToggleFullscreen: () => void;
  onInteraction: () => void;
  onMenuOpenChange: (open: boolean) => void;
}

export function VisionControls({
  visible,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  playbackRate,
  isFullscreen,
  title,
  chapters,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onPlaybackRateChange,
  onToggleFullscreen,
  onInteraction,
  onMenuOpenChange,
}: VisionControlsProps) {
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPercent, setHoverPercent] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const safeDuration = Math.max(0.001, duration);
  const progressPercent = Math.min(100, Math.max(0, (currentTime / safeDuration) * 100));
  const effectiveVolume = isMuted ? 0 : volume;

  const setSpeedOpen = (next: boolean) => {
    setSpeedMenuOpen(next);
    onMenuOpenChange(next);
  };

  const computeTimeFromClientX = (clientX: number): { time: number; percent: number } => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return { time: 0, percent: 0 };
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return { time: ratio * duration, percent: ratio * 100 };
  };

  const handleTrackPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onInteraction();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsScrubbing(true);
    const { time, percent } = computeTimeFromClientX(e.clientX);
    setHoverTime(time);
    setHoverPercent(percent);
    onSeek(time);
  };

  const handleTrackPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const { time, percent } = computeTimeFromClientX(e.clientX);
    setHoverTime(time);
    setHoverPercent(percent);
    if (isScrubbing) {
      onInteraction();
      onSeek(time);
    }
  };

  const handleTrackPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (isScrubbing) {
      setIsScrubbing(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const activeHoverChapter =
    hoverTime !== null && chapters
      ? chapters.find((c) => hoverTime >= c.startTime && hoverTime < c.endTime) ??
        chapters[chapters.length - 1]
      : null;

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end transition-opacity duration-300 ease-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Measured contrast scrim behind controls */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 sm:h-28 bg-gradient-to-t from-black/55 via-black/18 to-transparent" />

      {/* VisionOS floating frosted glass dock */}
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseMove={onInteraction}
        className={`relative mx-auto mb-2 sm:mb-3.5 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-3xl rounded-xl sm:rounded-2xl border border-white/22 px-2.5 sm:px-4 pt-1.5 sm:pt-2.5 pb-1.5 sm:pb-2.5 vision-glass transition-transform duration-300 ease-out ${
          visible ? 'pointer-events-auto translate-y-0' : 'pointer-events-none translate-y-2'
        }`}
      >
        {/* Interactive Timeline Scrubber */}
        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-label="Video timeline"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(currentTime)}
          aria-valuetext={`${formatTimecode(currentTime)} of ${formatTimecode(duration)}`}
          onPointerDown={handleTrackPointerDown}
          onPointerMove={handleTrackPointerMove}
          onPointerUp={handleTrackPointerUp}
          onPointerLeave={() => {
            if (!isScrubbing) setHoverTime(null);
          }}
          onKeyDown={(e) => {
            onInteraction();
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              onSeek(Math.min(duration, currentTime + 5));
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              onSeek(Math.max(0, currentTime - 5));
            }
          }}
          className="group relative flex h-5 cursor-pointer items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded"
        >
          {/* Floating hover timestamp preview */}
          {hoverTime !== null && (
            <div
              className="pointer-events-none absolute -top-9 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/15 bg-zinc-950/88 px-2.5 py-1 text-[11px] font-medium text-zinc-100 shadow-lg backdrop-blur-xl"
              style={{ left: `${Math.min(92, Math.max(8, hoverPercent))}%` }}
            >
              <span className="font-mono tabular-nums">{formatTimecode(hoverTime)}</span>
              {activeHoverChapter && (
                <span className="ml-2 text-zinc-400">{activeHoverChapter.title}</span>
              )}
            </div>
          )}

          {/* Track background */}
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/18 transition-[height] duration-150 group-hover:h-1.5">
            {/* Played fill */}
            <div
              className="h-full rounded-full bg-white/95"
              style={{ width: `${progressPercent}%` }}
            />

            {/* Subtle chapter markers */}
            {chapters &&
              chapters.slice(1).map((ch) => (
                <span
                  key={ch.id}
                  aria-hidden="true"
                  className="absolute top-0 bottom-0 w-[2px] bg-black/65"
                  style={{ left: `${(ch.startTime / safeDuration) * 100}%` }}
                />
              ))}
          </div>

          {/* Scrubber thumb */}
          <div
            className={`pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_1px_6px_rgba(0,0,0,0.55)] transition-transform duration-150 ${
              isScrubbing ? 'scale-115' : 'scale-0 group-hover:scale-100 group-focus-visible:scale-100'
            }`}
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Bottom Control Strip */}
        <div className="mt-1 flex items-center justify-between gap-3">
          {/* Left: Play/Pause, Volume, Timecode & Title */}
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                onInteraction();
                onTogglePlay();
              }}
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white transition-colors duration-150 hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 translate-x-[1px] fill-current" />}
            </button>

            {/* Volume mute + slider */}
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onInteraction();
                  onToggleMute();
                }}
                aria-label={effectiveVolume === 0 ? 'Unmute audio' : 'Mute audio'}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-200 transition-colors duration-150 hover:bg-white/12 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                {effectiveVolume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : effectiveVolume < 0.5 ? (
                  <Volume1 className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={effectiveVolume}
                aria-label="Volume"
                onChange={(e) => {
                  onInteraction();
                  onVolumeChange(parseFloat(e.target.value));
                }}
                className="vision-slider hidden w-18 sm:block"
                style={{
                  background: `linear-gradient(90deg, rgba(255,255,255,0.92) ${
                    effectiveVolume * 100
                  }%, rgba(255,255,255,0.2) ${effectiveVolume * 100}%)`,
                  borderRadius: '9999px',
                  height: '4px',
                }}
              />
            </div>

            {/* Timecode + subtle title */}
            <div className="ml-1 flex min-w-0 items-center gap-2 text-xs text-zinc-300">
              <span className="shrink-0 font-mono tabular-nums text-zinc-100">
                {formatTimecode(currentTime)}
              </span>
              <span className="text-zinc-500" aria-hidden="true">
                /
              </span>
              <span className="shrink-0 font-mono tabular-nums text-zinc-400">
                {formatTimecode(duration)}
              </span>
              <span className="hidden text-zinc-600 md:inline" aria-hidden="true">
                ·
              </span>
              <span className="hidden truncate text-zinc-300/90 md:inline">{title}</span>
            </div>
          </div>

          {/* Right: Playback Speed & Fullscreen */}
          <div className="flex shrink-0 items-center gap-1.5">
            {/* Playback Speed selector */}
            <div className="relative">
              <button
                type="button"
                aria-label={`Playback speed ${playbackRate}x`}
                aria-haspopup="menu"
                aria-expanded={speedMenuOpen}
                onClick={() => {
                  onInteraction();
                  setSpeedOpen(!speedMenuOpen);
                }}
                className="flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium text-zinc-200 transition-colors duration-150 hover:bg-white/12 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 whitespace-nowrap"
              >
                <Gauge className="h-3.5 w-3.5 text-zinc-300" />
                <span className="font-mono tabular-nums">{playbackRate}x</span>
              </button>

              {speedMenuOpen && (
                <div
                  role="menu"
                  aria-label="Playback speed options"
                  className="absolute right-0 bottom-11 z-30 min-w-[104px] rounded-xl border border-white/15 p-1 vision-glass"
                >
                  {PLAYBACK_SPEEDS.map((speed) => {
                    const active = playbackRate === speed;
                    return (
                      <button
                        key={speed}
                        type="button"
                        role="menuitemradio"
                        aria-checked={active}
                        onClick={() => {
                          onInteraction();
                          onPlaybackRateChange(speed);
                          setSpeedOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-mono tabular-nums transition-colors ${
                          active
                            ? 'bg-white/18 text-white font-medium'
                            : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span>{speed}x</span>
                        {active && <span className="text-[10px] text-zinc-200">On</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Fullscreen toggle */}
            <button
              type="button"
              onClick={() => {
                onInteraction();
                onToggleFullscreen();
              }}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-200 transition-colors duration-150 hover:bg-white/12 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
