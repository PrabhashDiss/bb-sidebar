export const SIDEBAR_SETTINGS_CHANNEL = "sidebar-settings";

export const CHILD_THREAD_SORT_FIELDS = ["created", "activity"] as const;
export type ChildThreadSortField = (typeof CHILD_THREAD_SORT_FIELDS)[number];
export const CHILD_THREAD_SORT_DIRECTIONS = ["ascending", "descending"] as const;
export type ChildThreadSortDirection =
  (typeof CHILD_THREAD_SORT_DIRECTIONS)[number];

export const CHILD_THREAD_ICON_STYLES = ["disc", "provider"] as const;
export type ChildThreadIconStyle = (typeof CHILD_THREAD_ICON_STYLES)[number];

export interface ChildThreadSort {
  field: ChildThreadSortField;
  direction: ChildThreadSortDirection;
}

export interface SidebarSettingsValues {
  snoozePresets: string;
  inactiveThreadsEnabled: boolean;
  inactiveAfterHours: number;
  showRunningChildrenWhenCollapsed: boolean;
  autoSettleInactive: boolean;
  autoSettleAfterDays: number;
  autoSettleOnMerge: boolean;
  childSortField: ChildThreadSortField;
  childSortDirection: ChildThreadSortDirection;
  childIconStyle: ChildThreadIconStyle;
}

import { safeSetItem } from "./lib/safe-storage";
import { DEFAULT_SNOOZE_PRESET_CONFIG } from "./lifecycle";

export const DEFAULT_SIDEBAR_SETTINGS: SidebarSettingsValues = {
  snoozePresets: DEFAULT_SNOOZE_PRESET_CONFIG,
  inactiveThreadsEnabled: true,
  inactiveAfterHours: 6,
  showRunningChildrenWhenCollapsed: true,
  autoSettleInactive: true,
  autoSettleAfterDays: 3,
  autoSettleOnMerge: true,
  childSortField: "created",
  childSortDirection: "ascending",
  childIconStyle: "disc",
};

export function childThreadSortOf(
  settings: SidebarSettingsValues | null,
): ChildThreadSort {
  return {
    field: settings?.childSortField ?? DEFAULT_SIDEBAR_SETTINGS.childSortField,
    direction:
      settings?.childSortDirection ??
      DEFAULT_SIDEBAR_SETTINGS.childSortDirection,
  };
}

const SIDEBAR_SETTINGS_CACHE_KEY = "bb-sidebar:settings-cache:v1";
const settingsByRpcClient = new WeakMap<object, SidebarSettingsValues>();

function readStoredSidebarSettings(): SidebarSettingsValues | null {
  try {
    const stored = window.localStorage.getItem(SIDEBAR_SETTINGS_CACHE_KEY);
    if (!stored) return null;
    const value = JSON.parse(stored) as Partial<SidebarSettingsValues>;
    if (
      typeof value.snoozePresets !== "string" ||
      typeof value.inactiveThreadsEnabled !== "boolean" ||
      typeof value.inactiveAfterHours !== "number" ||
      typeof value.showRunningChildrenWhenCollapsed !== "boolean" ||
      typeof value.autoSettleInactive !== "boolean" ||
      typeof value.autoSettleAfterDays !== "number" ||
      typeof value.autoSettleOnMerge !== "boolean"
    ) {
      return null;
    }
    // A cache written before the child-thread settings existed lacks them.
    // It is still good for everything else, so fill the gaps with defaults
    // instead of dropping it and flashing the old settings until the load.
    return {
      ...value,
      childSortField: CHILD_THREAD_SORT_FIELDS.includes(
        value.childSortField as ChildThreadSortField,
      )
        ? (value.childSortField as ChildThreadSortField)
        : DEFAULT_SIDEBAR_SETTINGS.childSortField,
      childSortDirection: CHILD_THREAD_SORT_DIRECTIONS.includes(
        value.childSortDirection as ChildThreadSortDirection,
      )
        ? (value.childSortDirection as ChildThreadSortDirection)
        : DEFAULT_SIDEBAR_SETTINGS.childSortDirection,
      childIconStyle: CHILD_THREAD_ICON_STYLES.includes(
        value.childIconStyle as ChildThreadIconStyle,
      )
        ? (value.childIconStyle as ChildThreadIconStyle)
        : DEFAULT_SIDEBAR_SETTINGS.childIconStyle,
    } as SidebarSettingsValues;
  } catch {
    return null;
  }
}

export function cachedSidebarSettings(
  rpcClient: object,
): SidebarSettingsValues | null {
  const cached = settingsByRpcClient.get(rpcClient);
  if (cached) return cached;
  const stored = readStoredSidebarSettings();
  if (stored) settingsByRpcClient.set(rpcClient, stored);
  return stored;
}

export function cacheSidebarSettings(
  rpcClient: object,
  values: SidebarSettingsValues,
): SidebarSettingsValues {
  settingsByRpcClient.set(rpcClient, values);
  safeSetItem(SIDEBAR_SETTINGS_CACHE_KEY, JSON.stringify(values));
  return values;
}
