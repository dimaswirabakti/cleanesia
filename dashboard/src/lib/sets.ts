/** Mengembalikan salinan Set dengan `val` ditambahkan bila belum ada, atau dihapus bila sudah ada. */
export function toggle<T>(set: Set<T>, val: T): Set<T> {
  const next = new Set(set);
  if (next.has(val)) next.delete(val);
  else next.add(val);
  return next;
}
