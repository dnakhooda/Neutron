import { Neutron } from "./neutron/neutron.ts";
import { draw, init, load, update } from "./main.ts";
import { Events } from "./events.ts";

Neutron.getEngine().init({
  tps: 75,

  scale: 2,

  events: new Events(),
  
  canvas: document.getElementById("canvas") as HTMLCanvasElement,

  draw: draw,
  update: update,
  init: init,
  load: load,
});
