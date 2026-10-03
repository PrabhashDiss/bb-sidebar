import type { PluginSidebarThread } from "@get-bb/plugin-sdk/app";
import { childStatusKind, childSubtree } from "./child-status";
import { isThreadWorking } from "./lifecycle";
import { threadShortStatus } from "./StatusSlot";

/**
 * Whether a thread, or anything under it, still has work running: its own
 * turn, its background agents, commands, workflows, and goals, and any
 * working child or grandchild. "Working" for children is the child badge's
 * test, so the row and its badge always agree.
 *
 * The thread itself needing you, or failing, outranks its children's work:
 * that is the user's cue, so such a thread never counts as working here.
 *
 * Decides both the compact row and the Working shelf.
 */
export function isWorkingTree(
  thread: PluginSidebarThread,
  childThreads: readonly PluginSidebarThread[],
  childrenByParent: ReadonlyMap<string, readonly PluginSidebarThread[]>,
): boolean {
  if (
    thread.hasPendingInteraction ||
    thread.indicator === "unread-error" ||
    thread.queuedWork === "failed"
  ) {
    return false;
  }
  return (
    threadShortStatus(thread)?.showsDuration === true ||
    isThreadWorking(thread) ||
    childSubtree(childThreads, childrenByParent).some(
      (child) => childStatusKind(child) === "working",
    )
  );
}
