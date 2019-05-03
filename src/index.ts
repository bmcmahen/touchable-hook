/**
 * The state machine used here is based on the one provided
 * in react-native-web:
 *
 * https://github.com/necolas/react-native-web/blob/master/packages/react-native-web/src/exports/Touchable/index.js
 */

import * as React from "react";
import { isHoverEnabled } from "./hover-enabled";
import { usePanResponder } from "pan-responder-hook";

/**
 * useTouchable
 *
 * useTouchable is a hook that attempt to emulate native touch behaviour for things
 * like list items, buttons, etc.
 *
 * const { bind, active } = useTouchable({
 *   onPress: () => console.log('hello'),
 *   disabled: false,
 *   delay: 120
 * })
 *
 */

const HIGHLIGHT_DELAY_MS = 100;
const PRESS_EXPAND_PX = 20;

type States =
  | "ERROR"
  | "NOT_RESPONDER"
  | "RESPONDER_ACTIVE_IN"
  | "RESPONDER_ACTIVE_OUT"
  | "RESPONDER_PRESSED_IN"
  | "RESPONDER_PRESSED_OUT";

type Events =
  | "DELAY"
  | "RESPONDER_GRANT"
  | "RESPONDER_RELEASE"
  | "RESPONDER_TERMINATED"
  | "ENTER_PRESS_RECT"
  | "LEAVE_PRESS_RECT";

type TransitionsType = { [key in States]: TransitionType };

type TransitionType = { [key in Events]: States };

const transitions = {
  NOT_RESPONDER: {
    DELAY: "NOT_RESPONDER",
    RESPONDER_GRANT: "RESPONDER_ACTIVE_IN",
    RESPONDER_RELEASE: "NOT_RESPONDER",
    RESPONDER_TERMINATED: "NOT_RESPONDER",
    ENTER_PRESS_RECT: "NOT_RESPONDER",
    LEAVE_PRESS_RECT: "NOT_RESPONDER"
  },
  RESPONDER_ACTIVE_IN: {
    DELAY: "RESPONDER_PRESSED_IN",
    RESPONDER_GRANT: "ERROR",
    RESPONDER_RELEASE: "NOT_RESPONDER",
    RESPONDER_TERMINATED: "NOT_RESPONDER",
    ENTER_PRESS_RECT: "RESPONDER_ACTIVE_IN",
    LEAVE_PRESS_RECT: "RESPONDER_ACTIVE_OUT"
  },
  RESPONDER_ACTIVE_OUT: {
    DELAY: "RESPONDER_PRESSED_OUT",
    RESPONDER_GRANT: "ERROR",
    RESPONDER_RELEASE: "NOT_RESPONDER",
    RESPONDER_TERMINATED: "NOT_RESPONDER",
    ENTER_PRESS_RECT: "RESPONDER_ACTIVE_IN",
    LEAVE_PRESS_RECT: "RESPONDER_ACTIVE_OUT"
  },
  RESPONDER_PRESSED_IN: {
    DELAY: "ERROR",
    RESPONDER_GRANT: "ERROR",
    RESPONDER_RELEASE: "NOT_RESPONDER",
    RESPONDER_TERMINATED: "NOT_RESPONDER",
    ENTER_PRESS_RECT: "RESPONDER_PRESSED_IN",
    LEAVE_PRESS_RECT: "RESPONDER_PRESSED_OUT"
  },
  RESPONDER_PRESSED_OUT: {
    DELAY: "ERROR",
    RESPONDER_GRANT: "ERROR",
    RESPONDER_RELEASE: "NOT_RESPONDER",
    RESPONDER_TERMINATED: "NOT_RESPONDER",
    ENTER_PRESS_RECT: "RESPONDER_PRESSED_IN",
    LEAVE_PRESS_RECT: "RESPONDER_PRESSED_OUT"
  },
  ERROR: {
    DELAY: "NOT_RESPONDER",
    RESPONDER_GRANT: "RESPONDER_ACTIVE_IN",
    RESPONDER_RELEASE: "NOT_RESPONDER",
    RESPONDER_TERMINATED: "NOT_RESPONDER",
    ENTER_PRESS_RECT: "NOT_RESPONDER",
    LEAVE_PRESS_RECT: "NOT_RESPONDER"
  }
} as TransitionsType;

export type OnPressFunction = (
  e?: React.TouchEvent | React.MouseEvent | React.KeyboardEvent | Event
) => void;

export interface TouchableOptions {
  delay: number;
  pressExpandPx: number;
  behavior: "button" | "link";
  disabled: boolean;
  onPress?: OnPressFunction;
}

const defaultOptions: TouchableOptions = {
  delay: HIGHLIGHT_DELAY_MS,
  pressExpandPx: PRESS_EXPAND_PX,
  behavior: "button",
  disabled: false,
  onPress: undefined
};

export function useTouchable(options: Partial<TouchableOptions> = {}) {
  const { onPress, delay, behavior, disabled: localDisabled } = {
    ...defaultOptions,
    ...options
  };
  const disabled = localDisabled;
  const ref = React.useRef<HTMLAnchorElement | HTMLDivElement | any>(null);
  const delayTimer = React.useRef<number>();
  const bounds = React.useRef<ClientRect>();
  const [hover, setHover] = React.useState(false);
  const [showHover, setShowHover] = React.useState(true);
  const [active, setActive] = React.useState(false);
  const state = React.useRef<States>("NOT_RESPONDER");

  /**
   * Transition from one state to another
   * @param event
   */

  function dispatch(event: Events) {
    const nextState = transitions[state.current][event];
    state.current = nextState;

    if (nextState === "RESPONDER_PRESSED_IN") {
      if (!active) setActive(true);
    } else {
      if (active) setActive(false);
    }

    if (nextState === "NOT_RESPONDER") {
      clearTimeout(delayTimer.current);
    }
  }

  // create a pan responder to handle mouse / touch gestures
  const { bind, terminateCurrentResponder } = usePanResponder({
    onStartShouldSet: () => true,
    onGrant: () => {
      onStart(isHoverEnabled() ? 0 : undefined);
    },
    onRelease: (_state, e) => onEnd(e),
    onMove: (_state, e) => onTouchMove(e),
    onTerminate: _state => onTerminate()
  });

  /**
   * Emit a press event if not disabled
   * @param e
   */

  function emitPress(
    e: React.TouchEvent | React.MouseEvent | React.KeyboardEvent | Event
  ) {
    if (!disabled && onPress) {
      onPress(e);
    }
  }

  function bindScroll() {
    document.addEventListener("scroll", onScroll, true);
  }

  function unbindScroll() {
    document.removeEventListener("scroll", onScroll, true);
  }

  function afterDelay() {
    dispatch("DELAY");
  }

  /**
   * Get our initial bounding box clientRect and set any delay
   * timers if necessary.
   * @param delayPressMs
   */

  function onStart(delayPressMs = delay) {
    dispatch("RESPONDER_GRANT");
    bounds.current = ref.current!.getBoundingClientRect();
    delayTimer.current =
      delayPressMs > 0
        ? window.setTimeout(afterDelay, delayPressMs)
        : undefined;
    if (delayPressMs === 0) {
      dispatch("DELAY");
    } else {
      bindScroll();
    }

    setShowHover(false);
  }

  // onTerminate should be disambiguated from onRelease
  // because it should never trigger onPress events.
  function onTerminate() {
    if (state.current === "NOT_RESPONDER") {
      return;
    }

    dispatch("RESPONDER_RELEASE");
    setShowHover(true);
    unbindScroll();
  }

  function onEnd(
    e?: React.TouchEvent | React.MouseEvent | React.KeyboardEvent | Event
  ) {
    // consider unbinding the end event instead
    if (state.current === "NOT_RESPONDER") {
      return;
    }

    if (
      e &&
      (state.current === "RESPONDER_ACTIVE_IN" ||
        state.current === "RESPONDER_PRESSED_IN")
    ) {
      emitPress(e);
    }

    dispatch("RESPONDER_RELEASE");
    setShowHover(true);
    unbindScroll();
  }

  function isWithinActiveBounds(
    clientX: number,
    clientY: number,
    rect: ClientRect,
    expandPx: number = PRESS_EXPAND_PX
  ) {
    return (
      clientX > rect.left - expandPx &&
      clientY > rect.top - expandPx &&
      clientX < rect.right + expandPx &&
      clientY < rect.bottom + expandPx
    );
  }

  /**
   * Determine if the touch remains in the active bounds
   * @param e
   */

  function onTouchMove(e: any) {
    if (state.current === "NOT_RESPONDER" || state.current === "ERROR") {
      return;
    }

    const { clientX, clientY } = e.touches && e.touches[0] ? e.touches[0] : e;
    const withinBounds = isWithinActiveBounds(
      clientX,
      clientY,
      bounds.current!
    );
    if (withinBounds) {
      dispatch("ENTER_PRESS_RECT");
    } else {
      dispatch("LEAVE_PRESS_RECT");
    }
  }

  /**
   * Scrolling cancels all responder events. This enables
   * the user to scroll without selecting something
   */

  function onScroll() {
    unbindScroll();
    dispatch("RESPONDER_TERMINATED");
  }

  /**
   * If our mouse leaves we terminate our responder,
   * even if our press remains down. This emulates
   * native mouse behaviour.
   * @param e
   */

  function onMouseLeave() {
    if (hover) {
      setHover(false);
    }
    if (!showHover) {
      setShowHover(true);
    }
    if (state.current !== "NOT_RESPONDER") {
      terminateCurrentResponder();
    }
  }

  function onMouseEnter() {
    if (!hover) {
      setHover(true);
    }
  }

  /**
   * Handle timer and disabled side-effects
   */

  React.useEffect(() => {
    return () => {
      clearTimeout(delayTimer.current);
      unbindScroll();
    };
  }, []);

  React.useEffect(() => {
    if (disabled && state.current !== "NOT_RESPONDER") {
      dispatch("RESPONDER_TERMINATED");
      setShowHover(true);
    }
  }, [disabled]);

  /**
   * Keyboard support
   * button:
   *   onEnterDown -> onPress
   *   onSpaceUp -> onPress
   * Prevent default.
   *
   * link: Don't prevent default
   */

  function onKey(e: React.KeyboardEvent) {
    const ENTER = 13;
    const SPACE = 32;

    if (e.type === "keydown" && e.which === SPACE) {
      onStart(0);
    } else if (e.type === "keydown" && e.which === ENTER) {
      emitPress(e);
    } else if (e.type === "keyup" && e.which === SPACE) {
      onEnd(e);
    } else {
      return;
    }

    e.stopPropagation();

    if (!(e.which === ENTER && behavior === "link")) {
      e.preventDefault();
    }
  }

  return {
    bind: {
      ...bind,
      onKeyUp: onKey,
      onKeyDown: onKey,
      onMouseEnter,
      onMouseLeave,
      ref
    },
    active: !disabled && active,
    hover: isHoverEnabled() && !disabled && hover && showHover
  };
}
