import * as React from "react";
import { render, fireEvent, cleanup } from "react-testing-library";
import "jest-dom/extend-expect";
import { useTouchable } from ".";

afterEach(cleanup);

function TouchableHighlight({ onPress, options = {} }: any) {
  const { bind, active, hover } = useTouchable({
    onPress,
    behavior: "button",
    ...options
  });

  return (
    <div
      data-testid="tester"
      data-hover={hover}
      data-active={active}
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
  );
}

test("onPress is called", () => {
  const press = jest.fn();

  const { getByTestId } = render(<TouchableHighlight onPress={press} />);

  const child = getByTestId("tester");
  fireEvent.mouseDown(child);
  fireEvent.mouseUp(child);
  expect(press).toBeCalled();
});

test("disabled", () => {
  const press = jest.fn();

  const { getByTestId } = render(
    <TouchableHighlight onPress={press} options={{ disabled: true }} />
  );

  const child = getByTestId("tester");
  fireEvent.mouseDown(child);
  fireEvent.mouseUp(child);
  expect(press).toBeCalledTimes(0);
});
