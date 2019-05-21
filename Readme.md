<div align="center">
    
# touchable-hook
  
[![npm package](https://img.shields.io/npm/v/touchable-hook/latest.svg)](https://www.npmjs.com/package/touchable-hook)
[![Follow on Twitter](https://img.shields.io/twitter/follow/benmcmahen.svg?style=social&logo=twitter)](
https://twitter.com/intent/follow?screen_name=benmcmahen
)

</div>

`touchable-hook` provides a react hook that emulates native touch behaviour for building performant, customizable interactive widgets like buttons, list items, etc. It's a limited implementation of the touchable interface found in [react-native-web](https://github.com/necolas/react-native-web/). It provides the basic touchable behaviour for [Sancho-UI](https://github.com/bmcmahen/sancho) and is built using [react-gesture-responder](https://github.com/bmcmahen/react-gesture-responder).

## Why?

When building mobile web apps it's challenging to get interactive elements to **feel** just right. Using this hook makes it easier:

- **hover state is provided only when using a mouse**.
- **active state is available after a configurable delay**. This is useful for avoiding highlighting list elements when scrolling, but providing immediate visual feedback on elements like buttons.
- **mouse and touch support**.
- **keyboard support** which emulates both button and anchor behaviour.
- **long press support**

## Install

Install both `touchable-hook` and `react-gesture-responder` using yarn or npm.

```
yarn add touchable-hook react-gesture-responder
```

```js
import { useTouchable } from "touchable-hook";

function TouchableHighlight({ onPress, onLongPress }) {
  const { bind, active, hover } = useTouchable({
    onPress,
    onLongPress,
    behavior: "button" // or 'link'
  });

  return (
    <div role="button" tabIndex={0} {...bind}>
      This is a touchable highlight
    </div>
  );
}
```
