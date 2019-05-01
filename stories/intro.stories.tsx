import * as React from "react";
import { storiesOf } from "@storybook/react";
import { useTouchable } from "../src/index";

function TouchableHighlight() {
  const [pressCount, setPressCount] = React.useState(0);

  function onPress() {
    console.log("Pressed!");
    setPressCount(pressCount + 1);
  }

  const { bind, active, hover } = useTouchable({
    onPress,
    behavior: "button"
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

storiesOf("Hello", module).add("Example", () => <TouchableHighlight />);
