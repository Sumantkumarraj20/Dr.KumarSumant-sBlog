// Small concurrency limiter
export async function mapWithConcurrency<T, R>(items: T[], mapper: (it: T) => Promise<R>, concurrency = 4): Promise<R[]> {
  const results: R[] = [];
  let idx = 0;

  async function worker() {
    while (true) {
      const i = idx++;
      if (i >= items.length) return;
      const item = items[i];
      const res = await mapper(item);
      results[i] = res;
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }).map(() => worker());
  await Promise.all(workers);
  return results;
}
