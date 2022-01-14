import { Neutron } from "./Neutron.js";
import { draw, init, load, update } from "../Main.js";
import { Render } from "../MainClasses/Render.js";
import { Events } from "../MainClasses/Events.js";
import { Game } from "../MainClasses/Game.js";
(() => {
    // Creating Objects
    const render = new Render(document.getElementById(`canvas`), draw, 2);
    const game = new Game();
    const events = new Events();
    const controller = new Neutron.Controller(render, events);
    const loader = new Neutron.Loader();
    // Initializing Engine
    Neutron.getEngine().init({
        update: update,
        draw: draw,
        init: init,
        load: load,
        tps: 80,
        render: render,
        game: game,
        controller: controller,
        loader: loader,
    });
})();
