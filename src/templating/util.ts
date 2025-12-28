type Falsy = false | "" | null | undefined;

export type ArrayLike<T> = T | Falsy | (T | Falsy)[];

export function toArray<T>(item: ArrayLike<T>): T[] {
  const array = Array.isArray(item) ? item : [item];
  return array.filter((i): i is T => i === 0 || !!i);
}
