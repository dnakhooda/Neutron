import { Neutron } from "../Neutron/Neutron.js";
export class Platform extends Neutron.Sprites.Platformer {
    constructor(id, x, y, width, height) {
        super(`${id}platform`, x, y, width, height, `red`, 10);
    }
}
