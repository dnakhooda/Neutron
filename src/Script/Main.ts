import { Neutron } from "./Neutron/Neutron.js";
import { Player } from "./GameClasses/Player.js";
import { Platform } from "./GameClasses/Platform.js";
import { Enemy } from "./GameClasses/Enemy.js";

export function draw() { 
    
}

export function update() {
    // Set Referances
    const players = Neutron.getGame().getSpritesByType<Player>(Player);
    const enemies = Neutron.getGame().getSpritesByType<Enemy>(Enemy);
    const camera = Neutron.getGame().getCamera;

    // Player
    players.forEach(player => {
        player.doMovement();
        player.movementConstraints();
        player.doGravity();

        // Add Friction
        const platformerBelow = player.getPlatformerBelowSelf()[0];
        if (platformerBelow instanceof Platform)
            player.addFrictionX(0.7);
        else 
            player.addFrictionX(0.9);
    });

    // Enemies
    enemies.forEach(enemy => {
        enemy.doMovement();
        enemy.movementConstraints();
        enemy.doGravity();
        
        // Add Friction
        const platformerBelow = enemy.getPlatformerBelowSelf()[0];
        if (platformerBelow instanceof Platform)
            enemy.addFrictionX(0.7);
        else 
            enemy.addFrictionX(0.9);
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

    // Create Platform Sprites
    Neutron.getGame().addNewSprite(new Platform(1, 0, Neutron.getRender().getHeight*(2/3), Neutron.getRender().getWidth, Neutron.getRender().getHeight));
    Neutron.getGame().addNewSprite(new Platform(2, 0, 100, 100, Neutron.getRender().getHeight));
    Neutron.getGame().addNewSprite(new Platform(3, Neutron.getRender().getWidth-100, 100, 100, Neutron.getRender().getHeight));
    Neutron.getGame().addNewSprite(new Platform(4, 0, 0, Neutron.getRender().getWidth, 100));
    Neutron.getGame().addNewSprite(new Platform(5, 100, 1000, 600, 100));
    Neutron.getGame().addNewSprite(new Platform(6, 100, 800, 400, 100));
    Neutron.getGame().addNewSprite(new Platform(7, 100, 600, 200, 100));

    // Create Bunch of Enemy Sprites
    for (let i = 0; i < 5; i++)
        Neutron.getGame().addNewSprite(new Enemy(i, Math.floor(Math.random()*Neutron.getRender().getWidth), 300));

    // Set Reverance to Player and Set Player Location
    const player = Neutron.getGame().getSpritesByType<Player>(Player)[0];
    player.getMovement.to(Neutron.Enums.ScreenPlaces.center);
}

export function load() {
    
}