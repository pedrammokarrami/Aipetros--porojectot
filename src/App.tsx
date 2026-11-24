import { useState, useCallback, useEffect, useRef } from 'react';
import { Upload, Sun, Moon } from 'lucide-react';
import {
  clampPlaybackRate,
  clampVolume,
  computeAmbientGlow,
  type AmbientColorRGB,
  type RoomLightMode,
  type VideoSource,
} from './utils/media';
import { BUILT_IN_TUTORIALS } from './utils/tutorials';
import { RoomEnvironment } from './components/RoomEnvironment';
import { ProjectionScreen } from './components/ProjectionScreen';
import { LoadVideoModal } from './components/LoadVideoModal';

const INITIAL_SOURCE: VideoSource = {
  id: 'demo-wave-optics',
  kind: 'demo',
  demoId: 'wave-optics',
  title: BUILT_IN_TUTORIALS['wave-optics'].title,
  subtitle: `${BUILT_IN_TUTORIALS['wave-optics'].courseCode} · ${BUILT_IN_TUTORIALS['wave-optics'].instructor}`,
};

export default function App() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const previousBlobUrlRef = useRef<string | null>(null);

  const [roomMode, setRoomMode] = useState<RoomLightMode>('cinema');
  const [source, setSource] = useState<VideoSource>(INITIAL_SOURCE);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(14);
  const [duration, setDuration] = useState(BUILT_IN_TUTORIALS['wave-optics'].duration);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [ambientRgb, setAmbientRgb] = useState<AmbientColorRGB>({
    r: 205,
    g: 218,
    b: 235,
  });

  const ambientGlow = computeAmbientGlow(ambientRgb, roomMode, isPlaying);

  const handleSelectSource = useCallback((nextSource: VideoSource) => {
    if (previousBlobUrlRef.current && previousBlobUrlRef.current !== nextSource.src) {
      URL.revokeObjectURL(previousBlobUrlRef.current);
      previousBlobUrlRef.current = null;
    }
    if (nextSource.isLocalFile && nextSource.src) {
      previousBlobUrlRef.current = nextSource.src;
    }

    setSource(nextSource);
    setCurrentTime(0);
    setIsPlaying(true);
    if (nextSource.kind === 'demo' && nextSource.demoId) {
      setDuration(BUILT_IN_TUTORIALS[nextSource.demoId].duration);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (previousBlobUrlRef.current) {
        URL.revokeObjectURL(previousBlobUrlRef.current);
      }
    };
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      const target = stageRef.current ?? document.documentElement;
      target.requestFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Keyboard shortcuts when modal is closed
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isLoadModalOpen) {
        if (e.key === 'Escape') {
          setIsLoadModalOpen(false);
        }
        return;
      }

      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        handleToggleFullscreen();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentTime((t) => Math.min(duration, t + 10));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTime((t) => Math.max(0, t - 10));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isLoadModalOpen, duration, handleToggleFullscreen]);

  const handleVolumeChange = useCallback((next: number) => {
    const clamped = clampVolume(next);
    setVolume(clamped);
    if (clamped > 0) setIsMuted(false);
  }, []);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    setPlaybackRate(clampPlaybackRate(rate));
  }, []);

  const toggleRoomMode = useCallback(() => {
    setRoomMode((prev) => (prev === 'cinema' ? 'classroom' : 'cinema'));
  }, []);

  const isClassroom = roomMode === 'classroom';

  return (
    <div
      ref={stageRef}
      data-room-mode={roomMode}
      className="relative h-screen w-screen overflow-hidden bg-[#050608] text-zinc-100 select-none"
    >
      {/* Architectural dark training room walls, ceiling projector unit, beam cone & desk silhouette */}
      <RoomEnvironment roomMode={roomMode} ambientGlow={ambientGlow} />

      {/* Centered 95vw x 95vh flat motorized projection screen & 16:9 VisionOS video player */}
      <ProjectionScreen
        source={source}
        ambientGlow={ambientGlow}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        playbackRate={playbackRate}
        isFullscreen={isFullscreen}
        onTogglePlay={() => setIsPlaying((prev) => !prev)}
        onSetPlaying={setIsPlaying}
        onTimeUpdate={setCurrentTime}
        onDurationReady={setDuration}
        onSeek={setCurrentTime}
        onVolumeChange={handleVolumeChange}
        onToggleMute={() => setIsMuted((prev) => !prev)}
        onPlaybackRateChange={handlePlaybackRateChange}
        onToggleFullscreen={handleToggleFullscreen}
        onAmbientColorChange={setAmbientRgb}
        onOpenLoadModal={() => setIsLoadModalOpen(true)}
      />

      {/* Discreet floating translucent Room Ambient Light toggle switch (top-left) */}
      <div className="fixed top-2.5 left-3 sm:top-3 sm:left-4 z-30">
        <button
          type="button"
          role="switch"
          aria-checked={isClassroom}
          aria-label="Room Ambient Light"
          onClick={toggleRoomMode}
          className="group flex h-8 sm:h-9 items-center gap-2 rounded-xl border border-white/18 px-2.5 sm:px-3 text-xs font-medium text-zinc-100 vision-glass-subtle opacity-90 transition-all duration-200 hover:border-white/30 hover:text-white hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 whitespace-nowrap"
        >
          {isClassroom ? (
            <Sun className="h-3.5 w-3.5 text-amber-300" />
          ) : (
            <Moon className="h-3.5 w-3.5 text-sky-300" />
          )}
          <span className="hidden sm:inline">
            {isClassroom ? 'Dim Classroom Mode' : 'Dark Cinema Mode'}
          </span>
          <span
            aria-hidden="true"
            className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full border border-white/18 transition-colors duration-200 ${
              isClassroom ? 'bg-amber-400/40' : 'bg-white/14'
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full bg-white shadow transition-transform duration-200 ${
                isClassroom ? 'translate-x-3.5' : 'translate-x-0.5'
              }`}
            />
          </span>
        </button>
      </div>

      {/* Discreet floating translucent Load Video / URL button (top-right) */}
      <div className="fixed top-2.5 right-3 sm:top-3 sm:right-4 z-30">
        <button
          type="button"
          aria-label="Load Video / URL"
          onClick={() => setIsLoadModalOpen(true)}
          className="flex h-8 sm:h-9 items-center gap-1.5 sm:gap-2 rounded-xl border border-white/18 px-2.5 sm:px-3.5 text-xs font-medium text-zinc-100 vision-glass-subtle opacity-90 transition-all duration-200 hover:border-white/30 hover:text-white hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 whitespace-nowrap"
        >
          <Upload className="h-3.5 w-3.5 text-zinc-200" />
          <span className="hidden sm:inline">Load Video / URL</span>
          <span className="sm:hidden">Load</span>
        </button>
      </div>

      {/* Frosted glass modal to paste Video URL, upload local video, or switch tutorial */}
      <LoadVideoModal
        isOpen={isLoadModalOpen}
        activeSourceId={source.id}
        onClose={() => setIsLoadModalOpen(false)}
        onSelectSource={handleSelectSource}
      />
    </div>
  );
}
