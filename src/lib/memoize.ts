/* eslint-disable @typescript-eslint/no-explicit-any */

type AnyFn = (...args: readonly any[]) => unknown;

type Cache<Args extends readonly any[], Return> = {
  get: (key: Args) => Return | null;
  set: (key: Args, value: Return) => void;
};

function memoizeWith<Fn extends AnyFn>(
  fn: Fn,
  makeCache: () => Cache<Parameters<Fn>, ReturnType<Fn>>,
): Fn {
  const cache = makeCache();

  const memoized = function (
    this: any,
    ...args: Parameters<Fn>
  ): ReturnType<Fn> {
    const cached = cache.get(args);
    if (cached !== null) {
      return cached;
    }
    const result = fn.apply(this, args) as ReturnType<Fn>;
    cache.set(args, result);
    return result;
  } as Fn;

  for (const property of Reflect.ownKeys(fn)) {
    if (
      property === "length" ||
      property === "prototype" ||
      property === "argunments" ||
      property === "prototype"
    ) {
      continue;
    }
    const fnDesc = Object.getOwnPropertyDescriptor(fn, property)!;
    const mmDesc = Object.getOwnPropertyDescriptor(memoized, property);
    if (
      mmDesc === undefined ||
      mmDesc.configurable ||
      (mmDesc.writable === fnDesc.writable &&
        mmDesc.enumerable === fnDesc.enumerable &&
        mmDesc.configurable === fnDesc.configurable &&
        (mmDesc.writable || mmDesc.value === fnDesc.value))
    ) {
      Object.defineProperty(memoized, property, fnDesc);
    }
  }

  Object.setPrototypeOf(memoized, Object.getPrototypeOf(fn) as object);

  return memoized;
}

function memoizeDecorator<Fn extends AnyFn>(
  makeCache: () => Cache<Parameters<Fn>, ReturnType<Fn>>,
) {
  return (target: Fn): Fn => {
    const instanceMap = new WeakMap<any, Fn>();
    return function (this: any, ...args: Parameters<Fn>): ReturnType<Fn> {
      let memoized = instanceMap.get(this);
      if (memoized === undefined) {
        memoized = memoizeWith(target, makeCache);
        instanceMap.set(this, memoized);
      }
      return memoized.apply(this, args) as ReturnType<Fn>;
    } as Fn;
  };
}

function memoize0<Fn extends () => unknown>() {
  return memoizeDecorator<Fn>(() => {
    let cache: unknown = null;
    return {
      get: () => {
        return cache;
      },
      set: (_, value) => {
        cache = value;
      },
    } as Cache<Parameters<Fn>, ReturnType<Fn>>;
  });
}

function memoize1<Fn extends (Arg: any) => unknown>() {
  return memoizeDecorator<Fn>(() => {
    const cache = new Map<any, unknown>();
    return {
      get: ([key]) => {
        return cache.get(key) ?? null;
      },
      set: ([key], value) => {
        cache.set(key, value);
      },
    } as Cache<Parameters<Fn>, ReturnType<Fn>>;
  });
}

function memoize2<Fn extends (Arg1: any, Arg2: any) => unknown>() {
  return memoizeDecorator<Fn>(() => {
    const cache = new Map<any, Map<any, unknown>>();
    return {
      get: ([outerKey, innerKey]) => {
        return cache.get(outerKey)?.get(innerKey) ?? null;
      },
      set: ([outerKey, innerKey], value) => {
        let inner = cache.get(outerKey);
        if (inner === undefined) {
          inner = new Map();
          cache.set(outerKey, inner);
        }
        inner.set(innerKey, value);
      },
    } as Cache<Parameters<Fn>, ReturnType<Fn>>;
  });
}

function memoize3<Fn extends (Arg1: any, Arg2: any, Arg3: any) => unknown>() {
  return memoizeDecorator<Fn>(() => {
    const cache = new Map<any, Map<any, Map<any, unknown>>>();
    return {
      get: ([outerKey, middleKey, innerKey]) => {
        return cache.get(outerKey)?.get(middleKey)?.get(innerKey) ?? null;
      },
      set: ([outerKey, middleKey, innerKey], value) => {
        let middle = cache.get(outerKey);
        if (middle === undefined) {
          middle = new Map();
          cache.set(outerKey, middle);
        }
        let inner = middle.get(middleKey);
        if (inner === undefined) {
          inner = new Map();
          middle.set(middleKey, inner);
        }
        inner.set(innerKey, value);
      },
    } as Cache<Parameters<Fn>, ReturnType<Fn>>;
  });
}

/** Memoize a class method that takes up to three arguments. */
export function memoize<const Fn extends AnyFn>(
  levels: 0 | 1 | 2 | 3,
): (target: Fn) => Fn;
export function memoize(levels: 0 | 1 | 2 | 3) {
  switch (levels) {
    case 0:
      return memoize0();
    case 1:
      return memoize1();
    case 2:
      return memoize2();
    case 3:
      return memoize3();
    default:
      levels satisfies never;
  }
}
