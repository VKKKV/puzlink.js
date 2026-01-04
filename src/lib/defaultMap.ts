/**
 * A map with a default value, kinda like Python's defaultDict.
 */
export class DefaultMap<K, V> extends Map<K, V> {
  private makeDefault: () => V;

  constructor(
    makeDefault: () => V,
    entries?: Iterable<readonly [K, V]> | null,
  ) {
    super(entries);
    this.makeDefault = makeDefault;
  }

  get(key: K): V {
    if (!this.has(key)) {
      this.set(key, this.makeDefault());
    }
    return super.get(key)!;
  }

  mapValues<U>(
    fn: (value: V, key: K) => U,
    makeDefault: () => U,
  ): DefaultMap<K, U>;
  mapValues<U>(fn: (value: V) => U): DefaultMap<K, U>;
  mapValues<U>(
    fn: (value: V, key: K) => U,
    makeDefault?: () => U,
  ): DefaultMap<K, U> {
    return new DefaultMap<K, U>(
      makeDefault ?? (() => fn(this.makeDefault(), undefined as K)),
      Array.from(this.entries(), ([key, value]) => [key, fn(value, key)]),
    );
  }
}
