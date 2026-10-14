import assert from 'node:assert/strict';
import test from 'node:test';

import { BatchUpdateManager } from '../utils/PerformanceUtils.ts';

function withFakeTimers(run) {
  const originalSetTimeout = globalThis.setTimeout;
  const originalClearTimeout = globalThis.clearTimeout;
  const timers = new Map();
  let nextTimerId = 1;

  globalThis.setTimeout = (callback, _delay, ...args) => {
    const timerId = nextTimerId++;
    timers.set(timerId, () => callback(...args));
    return timerId;
  };
  globalThis.clearTimeout = timerId => {
    timers.delete(timerId);
  };

  const fakeTimers = {
    flushNext() {
      const next = timers.entries().next().value;
      assert.ok(next, 'expected a pending batch timer');

      const [timerId, callback] = next;
      timers.delete(timerId);
      callback();
    },
    get pendingCount() {
      return timers.size;
    },
  };

  try {
    run(fakeTimers);
  } finally {
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  }
}

test('queues a same-key update made during a batch for the next batch', () => {
  withFakeTimers(timers => {
    const manager = new BatchUpdateManager();
    const calls = [];

    manager.queueUpdate('status', () => {
      calls.push('first');
      manager.queueUpdate('status', () => calls.push('second'));
    });

    timers.flushNext();
    assert.deepEqual(calls, ['first']);
    assert.equal(timers.pendingCount, 1);

    timers.flushNext();
    assert.deepEqual(calls, ['first', 'second']);
    assert.equal(timers.pendingCount, 0);
  });
});

test('queues a different-key update made during a batch for the next batch', () => {
  withFakeTimers(timers => {
    const manager = new BatchUpdateManager();
    const calls = [];

    manager.queueUpdate('first', () => {
      calls.push('first');
      manager.queueUpdate('second', () => calls.push('second'));
    });

    timers.flushNext();
    assert.deepEqual(calls, ['first']);
    assert.equal(timers.pendingCount, 1);

    timers.flushNext();
    assert.deepEqual(calls, ['first', 'second']);
  });
});

test('coalesces pending updates to the latest callback for each key', () => {
  withFakeTimers(timers => {
    const manager = new BatchUpdateManager();
    const calls = [];

    manager.queueUpdate('first', () => calls.push('stale'));
    manager.queueUpdate('second', () => calls.push('second'));
    manager.queueUpdate('first', () => calls.push('latest'));

    timers.flushNext();
    assert.deepEqual(calls, ['latest', 'second']);
    assert.equal(timers.pendingCount, 0);
  });
});

test('cancels pending work and supports a fresh later batch', () => {
  withFakeTimers(timers => {
    const manager = new BatchUpdateManager();
    const calls = [];

    manager.queueUpdate('cancelled', () => calls.push('cancelled'));
    manager.cancelUpdates();
    assert.equal(timers.pendingCount, 0);

    manager.queueUpdate('fresh', () => calls.push('fresh'));
    assert.equal(timers.pendingCount, 1);
    timers.flushNext();

    assert.deepEqual(calls, ['fresh']);
    assert.equal(timers.pendingCount, 0);
  });
});

test('continues processing queued callbacks after one throws', () => {
  withFakeTimers(timers => {
    const manager = new BatchUpdateManager();
    const calls = [];
    const originalConsoleError = console.error;
    console.error = () => {};

    try {
      manager.queueUpdate('throws', () => {
        throw new Error('expected test error');
      });
      manager.queueUpdate('runs', () => calls.push('runs'));

      timers.flushNext();
    } finally {
      console.error = originalConsoleError;
    }

    assert.deepEqual(calls, ['runs']);
    assert.equal(timers.pendingCount, 0);
  });
});
