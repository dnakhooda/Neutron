import { Neutron } from "../neutron/neutron.ts";

export class Platform extends Neutron.Platformer {
  constructor(id: number, x: number, y: number, width: number, height: number) {
    super(`${id}platform`, x, y, width, height, `#ff0000`, 10);
  }
}
