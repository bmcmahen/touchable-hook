import * as React from "react";
import { storiesOf } from "@storybook/react";
import { useTouchable } from "../src/index";

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
  ));
