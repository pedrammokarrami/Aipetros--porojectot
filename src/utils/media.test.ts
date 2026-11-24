import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTimecode,
  clampVolume,
  clampPlaybackRate,
  parseVideoUrl,
  computeAmbientGlow,
  formatFileSize,
} from './media';

test('formatTimecode formats seconds cleanly with zero padding', () => {
  assert.equal(formatTimecode(0), '0:00');
  assert.equal(formatTimecode(9), '0:09');
  assert.equal(formatTimecode(65), '1:05');
  assert.equal(formatTimecode(3661), '1:01:01');
  assert.equal(formatTimecode(-12), '0:00');
  assert.equal(formatTimecode(Number.NaN), '0:00');
});

test('clampVolume and clampPlaybackRate constrain inputs safely', () => {
  assert.equal(clampVolume(-0.4), 0);
  assert.equal(clampVolume(1.5), 1);
  assert.equal(clampVolume(0.642), 0.64);
  assert.equal(clampPlaybackRate(0.1), 0.5);
  assert.equal(clampPlaybackRate(4), 2);
  assert.equal(clampPlaybackRate(1.25), 1.25);
});

test('parseVideoUrl parses YouTube watch and short links', () => {
  const watch = parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.equal(watch.ok, true);
  if (watch.ok) {
    assert.equal(watch.source.kind, 'youtube');
    assert.equal(
      watch.source.embedUrl?.includes('youtube-nocookie.com/embed/dQw4w9WgXcQ'),
      true
    );
  }

  const short = parseVideoUrl('https://youtu.be/dQw4w9WgXcQ');
  assert.equal(short.ok, true);
  if (short.ok) {
    assert.equal(short.source.kind, 'youtube');
  }
});

test('parseVideoUrl parses Vimeo and direct MP4 URLs', () => {
  const vimeo = parseVideoUrl('https://vimeo.com/76979871');
  assert.equal(vimeo.ok, true);
  if (vimeo.ok) {
    assert.equal(vimeo.source.kind, 'vimeo');
    assert.equal(vimeo.source.embedUrl?.includes('player.vimeo.com/video/76979871'), true);
  }

  const mp4 = parseVideoUrl('https://cdn.example.edu/lectures/fourier_optics_04.mp4');
  assert.equal(mp4.ok, true);
  if (mp4.ok) {
    assert.equal(mp4.source.kind, 'native');
    assert.equal(mp4.source.title, 'fourier optics 04');
  }
});

test('parseVideoUrl rejects empty, malformed, and unsafe URLs', () => {
  assert.equal(parseVideoUrl('').ok, false);
  assert.equal(parseVideoUrl('not-a-url').ok, false);
  assert.equal(parseVideoUrl('javascript:alert(1)').ok, false);
  assert.equal(parseVideoUrl('https://localhost').ok, false);
});

test('computeAmbientGlow responds to room mode and playback state', () => {
  const cinemaPlaying = computeAmbientGlow({ r: 120, g: 165, b: 220 }, 'cinema', true);
  const classroomPlaying = computeAmbientGlow({ r: 120, g: 165, b: 220 }, 'classroom', true);
  const cinemaPaused = computeAmbientGlow({ r: 120, g: 165, b: 220 }, 'cinema', false);

  assert.equal(cinemaPlaying.beamOpacity > classroomPlaying.beamOpacity, true);
  assert.equal(cinemaPlaying.beamOpacity > cinemaPaused.beamOpacity, true);
  assert.equal(cinemaPlaying.primaryRgba.startsWith('rgba(120, 165, 220,'), true);
});

test('formatFileSize formats KB and MB cleanly', () => {
  assert.equal(formatFileSize(512000), '500 KB');
  assert.equal(formatFileSize(15 * 1024 * 1024), '15.0 MB');
});
