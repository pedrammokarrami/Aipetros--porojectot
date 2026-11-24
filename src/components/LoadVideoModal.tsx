import { useState, useRef, type FormEvent, type DragEvent } from 'react';
import { X, Link2, Upload, Film, AlertCircle, Check } from 'lucide-react';
import {
  parseVideoUrl,
  formatTimecode,
  formatFileSize,
  type VideoSource,
} from '../utils/media';
import { BUILT_IN_TUTORIALS, type BuiltInTutorial } from '../utils/tutorials';

interface LoadVideoModalProps {
  isOpen: boolean;
  activeSourceId: string;
  onClose: () => void;
  onSelectSource: (source: VideoSource) => void;
}

export function LoadVideoModal({
  isOpen,
  activeSourceId,
  onClose,
  onSelectSource,
}: LoadVideoModalProps) {
  const [urlInput, setUrlInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleUrlSubmit = (e: FormEvent) => {
    e.preventDefault();
    const outcome = parseVideoUrl(urlInput);
    if (!outcome.ok) {
      setErrorMessage(outcome.error);
      return;
    }
    setErrorMessage(null);
    setUrlInput('');
    onSelectSource(outcome.source);
    onClose();
  };

  const handleFileChosen = (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('video/') && !/\.(mp4|webm|ogg|mov|m4v)$/i.test(file.name)) {
      setErrorMessage('Please select a valid video file (MP4, WebM, MOV, or OGG).');
      return;
    }
    setErrorMessage(null);
    const objectUrl = URL.createObjectURL(file);
    const cleanTitle = file.name.replace(/\.[^.]+$/, '');
    onSelectSource({
      id: `local-${Date.now()}`,
      kind: 'native',
      title: cleanTitle || file.name,
      subtitle: `Local file · ${formatFileSize(file.size)}`,
      src: objectUrl,
      isLocalFile: true,
    });
    onClose();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFileChosen(file);
  };

  const handleSelectBuiltIn = (tutorial: BuiltInTutorial) => {
    setErrorMessage(null);
    onSelectSource({
      id: `demo-${tutorial.id}`,
      kind: 'demo',
      demoId: tutorial.id,
      title: tutorial.title,
      subtitle: `${tutorial.courseCode} · ${tutorial.instructor}`,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/68 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="load-video-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl border border-white/15 p-6 text-zinc-100 vision-glass"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="load-video-title" className="text-lg font-semibold tracking-tight text-white">
              Load Video onto Screen
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Paste a direct video link, YouTube or Vimeo URL, or upload a local video file.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close load video dialog"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Inline error banner */}
        {errorMessage && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-400/25 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section 1: Video URL Form */}
        <form onSubmit={handleUrlSubmit} className="mt-5">
          <label htmlFor="video-url-input" className="block text-xs font-medium text-zinc-300">
            Video URL
          </label>
          <div className="mt-2 flex gap-2">
            <div className="relative flex-1">
              <Link2 className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                id="video-url-input"
                type="text"
                inputMode="url"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="https://example.com/lecture.mp4 or YouTube / Vimeo link"
                className="h-10 w-full rounded-xl border border-white/12 bg-black/40 pr-3 pl-9 text-sm text-white placeholder:text-zinc-500 focus:border-sky-400/60 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
              />
            </div>
            <button
              type="submit"
              className="h-10 shrink-0 rounded-xl bg-white px-4 text-xs font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 whitespace-nowrap"
            >
              Load URL
            </button>
          </div>
        </form>

        {/* Section 2: Local File Upload */}
        <div className="mt-5">
          <span className="block text-xs font-medium text-zinc-300">Local Video File</span>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`mt-2 flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-5 text-center transition-colors ${
              isDragOver
                ? 'border-sky-400/70 bg-sky-500/10'
                : 'border-white/15 bg-black/25 hover:border-white/25'
            }`}
          >
            <Upload className="h-5 w-5 text-zinc-400" />
            <p className="mt-2 text-xs text-zinc-300">
              Drag and drop an MP4, WebM, or MOV video here
            </p>
            <input
              ref={fileInputRef}
              id="local-video-upload"
              type="file"
              accept="video/*"
              onChange={(e) => handleFileChosen(e.target.files?.[0])}
              className="sr-only"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 rounded-lg border border-white/15 bg-white/8 px-3.5 py-1.5 text-xs font-medium text-zinc-100 transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 whitespace-nowrap"
            >
              Choose File
            </button>
          </div>
        </div>

        {/* Section 3: Built-in Educational Lectures */}
        <div className="mt-5 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
            <Film className="h-3.5 w-3.5 text-zinc-400" />
            <span>Built-in Training Tutorials</span>
          </div>
          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
            {Object.values(BUILT_IN_TUTORIALS).map((tutorial) => {
              const isSelected = activeSourceId === `demo-${tutorial.id}`;
              return (
                <button
                  key={tutorial.id}
                  type="button"
                  onClick={() => handleSelectBuiltIn(tutorial)}
                  className={`flex flex-col items-start rounded-xl border px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                    isSelected
                      ? 'border-sky-400/45 bg-sky-400/10'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2 text-[11px] text-zinc-400">
                    <span className="truncate">{tutorial.courseCode}</span>
                    <span className="shrink-0 font-mono tabular-nums">
                      {formatTimecode(tutorial.duration)}
                    </span>
                  </div>
                  <div className="mt-1 flex w-full items-center justify-between gap-2">
                    <span className="text-xs font-medium text-zinc-100 line-clamp-1">
                      {tutorial.title}
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-sky-300" />}
                  </div>
                  <span className="mt-0.5 text-[11px] text-zinc-400">{tutorial.instructor}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
