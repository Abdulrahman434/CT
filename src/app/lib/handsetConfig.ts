export type HandsetAction =
  | "dial_digit"      // 0-9, *, # — appends to dialer
  | "channel_next"    // next IPTV channel
  | "channel_prev"    // previous IPTV channel
  | "hangup"          // end active call
  | "open_dialer"     // open call page + focus input
  | "nurse_call"      // call emergency ext immediately
  | "ignore";         // explicitly ignore

export interface HandsetKeyBinding {
  key?: string;         // e.g. "1", "*", "#"
  code?: string;        // e.g. "Digit1", "Digit8"
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: HandsetAction;
  /** For dial_digit: the character to append */
  digit?: string;
}

export interface HandsetProfile {
  id: string;
  name: string;
  bindings: HandsetKeyBinding[];
}

/** Current active handset model. Change this to switch profiles. */
export const ACTIVE_HANDSET: HandsetProfile = {
  id: "default",
  name: "Default Handset",
  bindings: [
    // Digit keys 0–9
    { code: "Digit0", ctrl: false, shift: false, action: "dial_digit", digit: "0" },
    { code: "Digit1", ctrl: false, shift: false, action: "dial_digit", digit: "1" },
    { code: "Digit2", ctrl: false, shift: false, action: "dial_digit", digit: "2" },
    { code: "Digit3", ctrl: false, shift: false, action: "dial_digit", digit: "3" },
    { code: "Digit4", ctrl: false, shift: false, action: "dial_digit", digit: "4" },
    { code: "Digit5", ctrl: false, shift: false, action: "dial_digit", digit: "5" },
    { code: "Digit6", ctrl: false, shift: false, action: "dial_digit", digit: "6" },
    { code: "Digit7", ctrl: false, shift: false, action: "dial_digit", digit: "7" },
    { code: "Digit8", ctrl: false, shift: false, action: "dial_digit", digit: "8" },
    { code: "Digit9", ctrl: false, shift: false, action: "dial_digit", digit: "9" },
    // Special dial chars
    { code: "Digit8", shift: true,  ctrl: false, action: "dial_digit", digit: "*" },
    { code: "Digit3", shift: true,  ctrl: false, action: "dial_digit", digit: "#" },
    // Handset function buttons
    { code: "Digit1", ctrl: true,  shift: false, action: "channel_next" },
    { code: "Digit2", ctrl: true,  shift: false, action: "channel_prev" },
    { code: "Digit3", ctrl: true,  shift: false, action: "hangup" },
    { code: "Digit4", ctrl: true,  shift: false, action: "open_dialer" },
    { code: "Digit5", ctrl: true,  shift: false, action: "nurse_call" },
    // Unknown / ignore
    { key: "Escape", alt: true, action: "ignore" },
  ],
};

/** Match a KeyboardEvent to a binding */
export function matchBinding(
  e: KeyboardEvent
): HandsetKeyBinding | null {
  for (const b of ACTIVE_HANDSET.bindings) {
    const keyMatch = b.key === undefined || b.key === e.key;
    const codeMatch = b.code === undefined || b.code === e.code;
    const ctrlMatch = b.ctrl === undefined || b.ctrl === e.ctrlKey;
    const shiftMatch = b.shift === undefined || b.shift === e.shiftKey;
    const altMatch = b.alt === undefined || b.alt === e.altKey;
    if (keyMatch && codeMatch && ctrlMatch && shiftMatch && altMatch) {
      return b;
    }
  }
  return null;
}
