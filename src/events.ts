import { Neutron } from "./neutron/neutron.ts";

export class Events implements Neutron.Events {
  isMouseDown: boolean;
  isTouchDown: boolean;
  mouseEvent: MouseEvent | null;
  touchEvent: TouchEvent | null;

  constructor() {
    this.isMouseDown = false;
    this.isTouchDown = false;
    this.mouseEvent = null;
    this.touchEvent = null;
  }

  onClick(e: KeyboardEvent) {
    switch (e.key) {
      case ``:
        break;
    }
  }

  offClick(e: KeyboardEvent) {
    switch (e.key) {
      case ``:
        break;
    }
  }

  mouseDown() {}

  mouseUp() {}

  mouseMove() {}

  touchStart() {}

  touchEnd() {}

  touchMove() {}

  whileMouseDown() {}

  whileTouchDown() {}
}
