import { createContext, useContext, useMemo } from "react";
import type { PluginSidebarThread } from "@get-bb/plugin-sdk/app";
import {
  childThreadSortOf,
  type ChildThreadSort,
  type SidebarSettingsValues,
} from "./sidebar-settings";

/**
 * How child threads are ordered wherever they appear: the sidebar list, the
 * header popover, the parent's badge, and hover cards.
 */
export interface ChildThreadDisplay {
  sort: ChildThreadSort;
}

export const ChildThreadDisplayContext = createContext<ChildThreadDisplay>({
  sort: childThreadSortOf(null),
});

export function useChildThreadDisplay(): ChildThreadDisplay {
  return useContext(ChildThreadDisplayContext);
}

/** The context value for one surface, stable while its inputs are. */
export function useChildThreadDisplayValue(
  settings: SidebarSettingsValues | null,
): ChildThreadDisplay {
  const { field, direction } = childThreadSortOf(settings);
  return useMemo(() => ({ sort: { field, direction } }), [field, direction]);
}

export function compareChildThreads(
  sort: ChildThreadSort,
): (left: PluginSidebarThread, right: PluginSidebarThread) => number {
  const key = sort.field === "activity" ? "updatedAt" : "createdAt";
  const sign = sort.direction === "descending" ? -1 : 1;
  return (left, right) =>
    sign * (left[key] - right[key] || left.createdAt - right.createdAt);
}
