import { Neutron } from "./Neutron/Neutron.js";
import { Player } from "./GameClasses/Player.js";

export function draw() { 
    
}

export function update() {
    // Set Referances
    const players = Neutron.getGame().getSpritesByType<Player>(Player);
    const camera = Neutron.getGame().getCamera;

    // Player
    players.forEach(player => {
        player.doMovement();
        player.movementConstraints();
    });

    // Camera
    camera.goTo(0, 0);
}

export function init() {
    // Higher Preformance Update Loop
    Neutron.getEngine().setHigherPreformanceUpdateLoop = true;

    // Make Canvas Cover Full Screen
    Neutron.getRender().makeCanvasCoverFullScreen(16, 9);
    window.addEventListener(`resize`, () => Neutron.getRender().makeCanvasCoverFullScreen(16, 9));

    // Create Player Sprite
    Neutron.getGame().addNewSprite(new Player(0,0));

    // Set Reverance to Player and Set Player Location
    const player = Neutron.getGame().getSpritesByType<Player>(Player)[0];
    player.getMovement.to(Neutron.Sprites.ScreenPlaces.center);
}

export function load() {
    
}