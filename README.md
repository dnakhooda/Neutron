# 🎮 ⚛ Neutron ⚛ 🎮

Neutron is a powerful framework and engine for creating web-based games and animations. Neutron provides flexible and easy-to-use tools for game development. Using your node package manager of choice, you can install Neutron into a new or existing TypeScript web application. Neutron takes heavy inspiration from Scratch. If you programmer looking to expand from what Scratch provides, Neutron is a great way to learn TypeScript and web game development.

## Features

- 🎮 Simple game development tools
- ⚡ Powerful WebGL rendering engine
- 🎯 Collision detection and 2d Physics Engine
- 🎵 Audio and Image support
- 📱 Responsive design support
- 🔧 Easy to integrate with existing web projects

## Installation

Neutron is available as a Node.js package and can be installed using your preferred package manager:

```bash
# Using npm
npm install neutron-game

# Using yarn
yarn add neutron-game

# Using bun
bun add neutron-game
```

## Quick Start

Here's a basic example of a Neutron game:

```typescript
// Import Neutron
import Neutron from "neutron-game";

// Create a custom Player class that extends Neutron's Sprite class
class Player extends Neutron.Sprite {
  constructor(x: number, y: number) {
    // Initialize the sprite with basic properties
    // Parameters: id, x, y, width, height, color, layer
    super("player", x, y, 100, 100, "#ff0000", 1);

    // Add a costume (image) to the player
    this.getCostumes().addCostume(
      `player`,
      Neutron.getLoader().getLoadedImageById(`player`)
    );

    // Set the active costume
    this.getCostumes().setCostumeById(`player`);
  }

  // This function runs every game tick
  update() {
    // Set movement speed
    const speed = 5;

    // Move up when up arrow is pressed
    if (Neutron.getController().getKey("ArrowUp")) {
      this.setY(this.getY() - speed);
    }

    // Move down when down arrow is pressed
    if (Neutron.getController().getKey("ArrowDown")) {
      this.setY(this.getY() + speed);
    }

    // Move left when left arrow is pressed
    if (Neutron.getController().getKey("ArrowLeft")) {
      this.setX(this.getX() - speed);
    }

    // Move right when right arrow is pressed
    if (Neutron.getController().getKey("ArrowRight")) {
      this.setX(this.getX() + speed);
    }
  }
}

// Function to load game assets (images and sounds)
function load() {
  // Load the player image
  Neutron.getLoader().loadImage("player", "/player.png");
}

// Function to initialize the game
function init() {
  // Set up the canvas with a 16:9 aspect ratio
  Neutron.getRender().ajustCanvasRatio(16, 9);

  // Handle window resizing
  window.addEventListener(`resize`, () =>
    Neutron.getRender().ajustCanvasRatio(16, 9)
  );

  // Create and add the player to the game
  const player = new Player(0, 0);
  Neutron.getGame().addNewSprite(player);

  // Center the player on screen
  player.to(Neutron.ScreenPlaces.CENTER);
}

// Function called every game tick (60 times per second)
function update() {
  // Add game logic here
}

// Function called every frame for rendering
function draw() {
  // Add custom drawing code here
}

// Create a class to handle game events (keyboard, mouse, touch)
class Events implements Neutron.Events {
  // Track input states
  isMouseDown: boolean;
  isTouchDown: boolean;
  mouseEvent: MouseEvent | null;
  touchEvent: TouchEvent | null;

  constructor() {
    // Initialize input states
    this.isMouseDown = false;
    this.isTouchDown = false;
    this.mouseEvent = null;
    this.touchEvent = null;
  }

  // Event handlers for keyboard input
  onKeyDown(e: KeyboardEvent) {}
  onKeyUp(e: KeyboardEvent) {}

  // Event handlers for mouse input
  mouseDown(e: MouseEvent) {}
  mouseUp(e: MouseEvent) {}
  mouseMove(e: MouseEvent) {}

  // Event handlers for touch input
  touchStart(e: TouchEvent) {}
  touchEnd(e: TouchEvent) {}
  touchMove(e: TouchEvent) {}

  // Continuous input handlers
  whileMouseDown(e: MouseEvent) {}
  whileTouchDown(e: TouchEvent) {}
}

// Initialize the game engine with configuration
Neutron.init({
  // Get the canvas element from the HTML
  canvas: document.getElementById("canvas") as HTMLCanvasElement,

  // Set game speed (ticks per second)
  tps: 60,

  // Set display scale
  scale: 2,

  // Set up event handling
  events: new Events(),

  load: load, // Load assets
  init: init, // Initialize game
  update: update, // Game logic
  draw: draw, // Custom rendering
});
```

## HTML Setup

Add a canvas element to your HTML:

```html
<canvas id="canvas" width="800" height="600"></canvas>
```

## Core Idea

There are seven main objects in Neutron, each with its respective purpose:

- Engine (Neutron.getEngine())
- Render (Neutron.getRender())
- Loader (Neutron.getLoader())
- Events (Neutron.getEvents())
- Controller (Neutron.getController())
- Game (Neutron.getGame())
- Camera (Neutron.getCamera())

These objects contain many well-documented methods and features.

## Documentation

All features in Neutron are contained within the Neutron namespace. To access Neutron's features and explore its various methods, use the Neutron namespace.

## Contributing

Neutron's code is open for you to view and suggest improvements. You may clone, make pull requests, and fork Neutron.
