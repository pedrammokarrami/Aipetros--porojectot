import test from 'node:test';
import assert from 'node:assert/strict';
import { BUILT_IN_TUTORIALS, getChapterStateAtTime } from './tutorials';

test('getChapterStateAtTime resolves first, middle, and final chapters cleanly', () => {
  const optics = BUILT_IN_TUTORIALS['wave-optics'];

  const start = getChapterStateAtTime(optics, 0);
  assert.equal(start.chapter.id, 'superposition');
  assert.equal(start.chapterProgress, 0);
  assert.equal(start.overallProgress, 0);

  const mid = getChapterStateAtTime(optics, 90);
  assert.equal(mid.chapter.id, 'double-slit');
  assert.equal(mid.chapterProgress, 0.5);

  const end = getChapterStateAtTime(optics, 240);
  assert.equal(end.chapter.id, 'fourier-aperture');
  assert.equal(end.chapterProgress, 1);
  assert.equal(end.overallProgress, 1);
});

test('getChapterStateAtTime clamps out-of-range times safely', () => {
  const consensus = BUILT_IN_TUTORIALS['distributed-consensus'];
  const below = getChapterStateAtTime(consensus, -50);
  assert.equal(below.chapter.id, 'quorum');
  assert.equal(below.overallProgress, 0);

  const above = getChapterStateAtTime(consensus, 999);
  assert.equal(above.chapter.id, 'log-matching');
  assert.equal(above.overallProgress, 1);
});
