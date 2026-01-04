/** A map with a default value, kinda like Python's defaultDict. */
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

/** A readonly version of DefaultMap. */
export class ReadonlyDefaultMap<K, V> implements ReadonlyMap<K, V> {
  private readonly map: DefaultMap<K, V>;

  constructor(
    makeDefault: () => V,
    entries?: Iterable<readonly [K, V]> | null,
  ) {
    this.map = new DefaultMap(makeDefault, entries);
  }

  forEach(
    callbackfn: (value: V, key: K, map: ReadonlyMap<K, V>) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    thisArg?: any,
  ): void {
    this.map.forEach(callbackfn, thisArg);
  }

  get(key: K): V {
    return this.map.get(key);
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  get size() {
    return this.map.size;
  }

  entries(): MapIterator<[K, V]> {
    return this.map.entries();
  }

  values(): MapIterator<V> {
    return this.map.values();
  }

  keys(): MapIterator<K> {
    return this.map.keys();
  }

  [Symbol.iterator](): MapIterator<[K, V]> {
    return this.map[Symbol.iterator]();
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
    return this.map.mapValues(fn, makeDefault!);
  }
}
