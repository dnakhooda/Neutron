import { Neutron } from "../Neutron/Neutron.js";

export class Platform extends Neutron.Sprites.Platformer {
    constructor (id:number, x:number, y:number, width:number, height:number) {
        super(`${id}platform`, x, y, width, height, `red`, 10);
    }
}