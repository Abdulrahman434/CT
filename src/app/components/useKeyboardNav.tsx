import { useEffect, useCallback, useRef } from "react";

/**
 * Keyboard Navigation Hook for the Bedside Screen.
 *
 * Arrow keys move focus between all focusable [data-nav] elements.
 * Enter/Space activates (clicks) the focused element.
 * Escape closes any overlay (calls onEscape if provided).
 *
 * Each navigable element should have:
 *   data-nav="true"
 *   data-nav-col={number}   — logical column position
 *   data-nav-row={number}   — logical row position
 *
 * The hook finds the closest element in the pressed arrow direction.
 */

export const NAV_ATTR = "data-nav";
export const NAV_COL = "data-nav-col";
export const NAV_ROW = "data-nav-row";

interface NavNode {
  el: HTMLElement;
  col: number;
  row: number;
  rect: DOMRect;
}

function getNavNodes(container: HTMLElement | null): NavNode[] {
  if (!container) return [];
  const els = container.querySelectorAll<HTMLElement>(`[${NAV_ATTR}="true"]`);
  const nodes: NavNode[] = [];
  els.forEach((el) => {
    // Skip hidden / invisible elements
    if (el.offsetParent === null) return;
    const col = parseInt(el.getAttribute(NAV_COL) || "0", 10);
    const row = parseInt(el.getAttribute(NAV_ROW) || "0", 10);
    nodes.push({ el, col, row, rect: el.getBoundingClientRect() });
  });
  return nodes;
}

function findClosest(
  nodes: NavNode[],
  current: NavNode,
  direction: "up" | "down" | "left" | "right"
): NavNode | null {
  // Filter candidates by direction relative to the current element's center
  const cx = current.rect.left + current.rect.width / 2;
  const cy = current.rect.top + current.rect.height / 2;

  let candidates: NavNode[];

  switch (direction) {
    case "up":
      candidates = nodes.filter((n) => {
        const ny = n.rect.top + n.rect.height / 2;
        return ny < cy - 5 && n !== current;
      });
      break;
    case "down":
      candidates = nodes.filter((n) => {
        const ny = n.rect.top + n.rect.height / 2;
        return ny > cy + 5 && n !== current;
      });
      break;
    case "left":
      candidates = nodes.filter((n) => {
        const nx = n.rect.left + n.rect.width / 2;
        return nx < cx - 5 && n !== current;
      });
      break;
    case "right":
      candidates = nodes.filter((n) => {
        const nx = n.rect.left + n.rect.width / 2;
        return nx > cx + 5 && n !== current;
      });
      break;
  }

  if (candidates.length === 0) return null;

  // Find the candidate with the smallest Euclidean distance, with a bias toward
  // staying in the same row/column axis
  let best = candidates[0];
  let bestDist = Infinity;

  for (const c of candidates) {
    const ncx = c.rect.left + c.rect.width / 2;
    const ncy = c.rect.top + c.rect.height / 2;
    const dx = ncx - cx;
    const dy = ncy - cy;

    // Weight: penalize off-axis movement
    let dist: number;
    if (direction === "up" || direction === "down") {
      dist = Math.abs(dy) + Math.abs(dx) * 2;
    } else {
      dist = Math.abs(dx) + Math.abs(dy) * 2;
    }
    if (dist < bestDist) {
      bestDist = dist;
      best = c;
    }
  }

  return best;
}

/**
 * Main hook to enable keyboard navigation inside a container.
 *
 * @param enabled  Whether navigation is active (disable when overlays open)
 * @param onEscape Called when Escape is pressed
 */
export function useKeyboardNav(
  enabled: boolean = true,
  onEscape?: () => void
) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;
      const container = containerRef.current;
      if (!container) return;

      // Escape
      if (e.key === "Escape") {
        onEscape?.();
        return;
      }

      // Only handle arrow/enter/space
      const arrowKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
      const isArrow = arrowKeys.includes(e.key);
      const isActivate = e.key === "Enter" || e.key === " ";

      if (!isArrow && !isActivate) return;

      e.preventDefault();

      const nodes = getNavNodes(container);
      if (nodes.length === 0) return;

      // Find currently focused node
      const focused = document.activeElement as HTMLElement;
      const currentNode = nodes.find((n) => n.el === focused || n.el.contains(focused));

      if (isActivate) {
        if (currentNode) {
          currentNode.el.click();
        }
        return;
      }

      // Arrow navigation
      if (!currentNode) {
        // Nothing focused yet — focus first element
        nodes[0].el.focus();
        return;
      }

      const directionMap: Record<string, "up" | "down" | "left" | "right"> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };

      // For RTL, swap left/right
      const isRTL = container.getAttribute("dir") === "rtl" || 
                     getComputedStyle(container).direction === "rtl";
      let dir = directionMap[e.key];
      if (isRTL) {
        if (dir === "left") dir = "right";
        else if (dir === "right") dir = "left";
      }

      const target = findClosest(nodes, currentNode, dir);
      if (target) {
        target.el.focus();
      }
    },
    [enabled, onEscape]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return containerRef;
}

/* ─── Focus ring styles (injected once) ─── */
export function KeyboardNavStyles() {
  return (
    <style>{`
      [data-nav="true"]:focus {
        outline: 3px solid rgba(0, 139, 174, 0.7);
        outline-offset: 3px;
        z-index: 5;
      }
      [data-nav="true"]:focus:not(:focus-visible) {
        outline: none;
      }
      [data-nav="true"]:focus-visible {
        outline: 3px solid rgba(0, 139, 174, 0.7);
        outline-offset: 3px;
        z-index: 5;
        transition: outline-offset 0.15s ease;
      }
    `}</style>
  );
}
