export type RoomLightMode = 'cinema' | 'classroom';

export type VideoSourceKind = 'demo' | 'native' | 'youtube' | 'vimeo';

export interface VideoSource {
  id: string;
  kind: VideoSourceKind;
  title: string;
  subtitle?: string;
  src?: string;
  embedUrl?: string;
  demoId?: 'wave-optics' | 'distributed-consensus';
  isLocalFile?: boolean;
}

export interface ParseVideoResult {
  ok: true;
  source: VideoSource;
}

export interface ParseVideoError {
  ok: false;
  error: string;
}

export type ParseVideoOutcome = ParseVideoResult | ParseVideoError;

export interface AmbientColorRGB {
  r: number;
  g: number;
  b: number;
}

export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

export function formatTimecode(rawSeconds: number): string {
  if (!Number.isFinite(rawSeconds) || rawSeconds < 0) {
    return '0:00';
  }
  const totalSeconds = Math.floor(rawSeconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const paddedSec = seconds.toString().padStart(2, '0');
  if (hours > 0) {
    const paddedMin = minutes.toString().padStart(2, '0');
    return `${hours}:${paddedMin}:${paddedSec}`;
  }
  return `${minutes}:${paddedSec}`;
}

export function clampVolume(volume: number): number {
  if (!Number.isFinite(volume)) return 0.75;
  return Math.min(1, Math.max(0, Math.round(volume * 100) / 100));
}

export function clampPlaybackRate(rate: number): number {
  if (!Number.isFinite(rate)) return 1;
  return Math.min(2, Math.max(0.5, rate));
}

export function extractYouTubeId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
  }
  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    if (url.pathname === '/watch') {
      const id = url.searchParams.get('v');
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    const match = url.pathname.match(/^\/(embed|shorts|live)\/([a-zA-Z0-9_-]{11})/);
    if (match) return match[2];
  }
  return null;
}

export function extractVimeoId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const match = url.pathname.match(/\/(?:video\/)?(\d{5,12})(?:\/|$)/);
    if (match) return match[1];
  }
  return null;
}

export function deriveTitleFromUrl(url: URL): string {
  const segments = url.pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last) return url.hostname;
  const decoded = decodeURIComponent(last).replace(/\.[a-z0-9]{2,5}$/i, '');
  const clean = decoded.replace(/[-_]+/g, ' ').trim();
  return clean.length > 0 ? clean : url.hostname;
}

export function parseVideoUrl(rawInput: string): ParseVideoOutcome {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      ok: false,
      error: 'Please enter a video URL (MP4, WebM, YouTube, or Vimeo).',
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      ok: false,
      error: 'That does not look like a valid URL. Include https:// at the start.',
    };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:' && parsed.protocol !== 'blob:') {
    return {
      ok: false,
      error: 'Only HTTP, HTTPS, or local video URLs are supported.',
    };
  }

  const ytId = extractYouTubeId(parsed);
  if (ytId) {
    return {
      ok: true,
      source: {
        id: `yt-${ytId}`,
        kind: 'youtube',
        title: 'YouTube Tutorial',
        subtitle: `youtube.com · ${ytId}`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`,
      },
    };
  }

  const vimeoId = extractVimeoId(parsed);
  if (vimeoId) {
    return {
      ok: true,
      source: {
        id: `vimeo-${vimeoId}`,
        kind: 'vimeo',
        title: 'Vimeo Tutorial',
        subtitle: `vimeo.com · ${vimeoId}`,
        embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`,
      },
    };
  }

  const looksLikeDirectVideo =
    parsed.protocol === 'blob:' ||
    /\.(mp4|webm|ogg|ogv|mov|m4v)(\?.*)?$/i.test(parsed.pathname) ||
    parsed.pathname.includes('/video') ||
    parsed.searchParams.has('mime');

  if (!looksLikeDirectVideo) {
    // Still allow direct streaming URLs if https/http, as long as host is present
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      return {
        ok: false,
        error: 'Enter a complete video link such as an .mp4, .webm, YouTube, or Vimeo URL.',
      };
    }
  }

  return {
    ok: true,
    source: {
      id: `url-${Date.now()}`,
      kind: 'native',
      title: deriveTitleFromUrl(parsed),
      subtitle: parsed.hostname,
      src: parsed.toString(),
    },
  };
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface AmbientGlowSpec {
  primaryRgba: string;
  secondaryRgba: string;
  beamOpacity: number;
}

export function computeAmbientGlow(
  color: AmbientColorRGB,
  roomMode: RoomLightMode,
  isPlaying: boolean
): AmbientGlowSpec {
  const r = Math.min(255, Math.max(0, Math.round(color.r)));
  const g = Math.min(255, Math.max(0, Math.round(color.g)));
  const b = Math.min(255, Math.max(0, Math.round(color.b)));

  // Realistic projected bounce glow & visible volumetric beam in both room lighting modes
  const baseStrength = roomMode === 'cinema' ? 0.38 : 0.24;
  const playMultiplier = isPlaying ? 1 : 0.84;
  const primaryAlpha = Number((baseStrength * playMultiplier).toFixed(3));
  const secondaryAlpha = Number((baseStrength * 0.52 * playMultiplier).toFixed(3));
  const beamOpacity = Number(((roomMode === 'cinema' ? 0.82 : 0.54) * playMultiplier).toFixed(3));

  return {
    primaryRgba: `rgba(${r}, ${g}, ${b}, ${primaryAlpha})`,
    secondaryRgba: `rgba(${r}, ${g}, ${b}, ${secondaryAlpha})`,
    beamOpacity,
  };
}
