import { runInNewContext } from 'node:vm';

// A normal test timeout cannot interrupt a synchronous infinite loop.
export default function runWithTimeout<T>(callback: () => T): T {
  return runInNewContext('callback()', { callback }, { timeout: 1000 });
}
