import assert from 'node:assert/strict';
import { episodes, chapterFor } from './app.js';

assert.equal(episodes.length, 25, '작품 수는 25편이어야 한다');
assert.deepEqual(episodes.map(x => x.id), Array.from({ length: 25 }, (_, i) => String(i + 1).padStart(3, '0')));
assert.equal(new Set(episodes.map(x => x.image)).size, 25, '이미지 URL은 중복되면 안 된다');
assert.ok(episodes.every(x => x.image.endsWith(`three-body-daily-${x.id}.png`)));
assert.deepEqual([chapterFor(1), chapterFor(8), chapterFor(17)], ['신호', '변이', '접촉']);
assert.match(episodes.at(-1).title, /답신/);

console.log('PASS episodes=25 unique=25 chapters=3 milestone=025');
