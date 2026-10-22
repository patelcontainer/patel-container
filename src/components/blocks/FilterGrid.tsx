"use client";

import { useMemo, useState, type ReactNode } from "react";

/** Client-side filter tabs over a list of items. */
export function FilterGrid<T>({
  items,
  getGroups,
  render,
  allLabel = "All",
  gridClass = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
  order,
  empty = "Nothing here yet.",
}: {
  items: T[];
  getGroups: (item: T) => string[];
  render: (item: T, index: number) => ReactNode;
  allLabel?: string;
  gridClass?: string;
  order?: string[];
  empty?: string;
}) {
  const [active, setActive] = useState(allLabel);
  const groups = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => getGroups(i).forEach((g) => g && set.add(g)));
    const list = [...set];
    if (order) list.sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99));
    return list;
  }, [items, getGroups, order]);
  const visible = active === allLabel ? items : items.filter((i) => getGroups(i).includes(active));

  return (
    <>
      {groups.length > 1 && (
        <div className="no-scrollbar -mx-4 mb-10 flex gap-2 overflow-x-auto px-4" role="tablist">
          {[allLabel, ...groups].map((g) => (
            <button
              key={g}
              type="button"
              role="tab"
              aria-selected={active === g}
              onClick={() => setActive(g)}
              className={`h-10 shrink-0 rounded-full px-5 text-sm font-semibold transition ${
                active === g ? "bg-navy-900 text-white" : "bg-white text-steel-600 ring-1 ring-line hover:text-ink hover:ring-ink"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}
      {visible.length ? <div className={gridClass}>{visible.map((it, i) => render(it, i))}</div> : <p className="text-steel-500">{empty}</p>}
    </>
  );
}
