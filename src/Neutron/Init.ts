import { Neutron } from "./Neutron.ts";
import { draw, init, load, update } from "../Main.ts";
import { Render } from "../main/Render.ts";
import { Events } from "../main/Events.ts";
import { Game } from "../main/Game.ts";

(() => {
  // Creating Objects
  const render = new Render(
    <HTMLCanvasElement>document.getElementById(`canvas`),
    draw,
    4
  );
  const game = new Game();
  const events = new Events();
  const controller = new Neutron.Controller(render, events);
  const loader = new Neutron.Loader();

  // Initializing Engine
  Neutron.getEngine().init({
    update: update,
    init: init,
    load: load,
    events: events,

    tps: 75,

    render: render,
    game: game,
    controller: controller,
    loader: loader,
  });
})();
