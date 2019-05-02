import * as React from "react";
import { storiesOf } from "@storybook/react";
import { useTouchable } from "../src/index";
import { usePanResponder } from "pan-responder-hook";

function TouchableHighlight({ options = {} }) {
  const [pressCount, setPressCount] = React.useState(0);

  function onPress() {
    console.log("Pressed!");
    setPressCount(pressCount + 1);
  }

  const { bind, active, hover } = useTouchable({
    onPress,
    behavior: "button",
    ...options
  });

  return (
    <div>
      {pressCount}
      <div
        role="button"
        tabIndex={0}
        {...bind}
        style={{
          border: hover ? "1px solid black" : "1px solid transparent",
          userSelect: "none",
          outline: "none",
          background: active ? "#08e" : "transparent"
        }}
      >
        This is a touchable highlight
      </div>
    </div>
  );
}

function Parent({ children }: any) {
  const { bind } = usePanResponder({
    onMoveShouldSet: () => true
  });

  return (
    <div {...bind} style={{ padding: "100px" }}>
      {children}
    </div>
  );
}

storiesOf("Hello", module)
  .add("Example", () => <TouchableHighlight />)
  .add("no delay", () => <TouchableHighlight options={{ delay: 0 }} />)
  .add("disabled", () => <TouchableHighlight options={{ disabled: true }} />)
  .add("within a scroll", () => (
    <div
      style={{
        height: "300px",
        overflowY: "scroll"
      }}
    >
      <div style={{ height: "350px" }} />
      <TouchableHighlight />
      <div style={{ height: "100px" }} />
    </div>
  ))
  .add("disables with parent responder", () => (
    <div>
      <TouchableHighlight />

      <div
        style={{
          border: "1px solid"
        }}
      >
        <Parent>
          <TouchableHighlight />
        </Parent>
      </div>
    </div>
  ))
  .add("without onPress", () => <TouchableWithoutPress />);

function TouchableWithoutPress({ options = {} }) {
  const { bind, active, hover } = useTouchable({
    behavior: "button",
    onPress: undefined,
    ...options
  });

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        {...bind}
        style={{
          border: hover ? "1px solid black" : "1px solid transparent",
          userSelect: "none",
          outline: "none",
          background: active ? "#08e" : "transparent"
        }}
      >
        This is a touchable highlight
      </div>
    </div>
  );
}
