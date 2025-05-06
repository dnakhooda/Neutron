/**
 * Neutron namespace provides a game engine framework for creating interactive applications;
 * includes core functionality for rendering, game state management, and event handling and more.
 */
declare namespace Neutron {
    /**
     * Interface defining the settings and components required to initialize the game engine.
     */
    interface EngineSettings {
        /** HTMLCanvasElement for the game. This is where all rendering will occur. */
        canvas: HTMLCanvasElement;
        /** Target ticks per second for the game loop. Controls how often the game state updates. */
        tps: number;
        /** Scale of the canvas. 1 is normal, 2 is double the size, 3 is triple the size, etc. */
        scale: number;
        /** Events object that implements the Events interface for handling user input. */
        events: Events;
        /** Function called every frame when drawing the game. Handles all rendering operations. */
        draw: () => void;
        /** Function called every tick when updating the game state. Handles game logic and physics. */
        update: () => void;
        /** Function called to initialize the game. Sets up initial game state. */
        init: () => void;
        /** Function called to load game assets */
        load: () => void;
    }
    /**
     * Manages the game loop, rendering, and game state updates.
     * The Engine class is responsible for:
     * - Controlling frame rate and game speed
     * - Managing performance monitoring
     * - Handling game state updates
     * - Coordinating between different game systems
     */
    class Engine {
        /** Current frames per second. Updated every second. */
        private fps;
        /** Current ticks per second. Updated every second. */
        private tps;
        /** Counter for FPS (frames per second) calculation. Reset every second. */
        private fpsCounter;
        /** Counter for TPS (ticks per second) calculation. Reset every second. */
        private tpsCounter;
        /** Target ticks per second for the game loop. Controls game speed. */
        private idealTps;
        /** Timestamp of the last update. Used for delta time calculation. */
        private lastUpdateTime;
        /** Minimum time between updates in milliseconds. Based on idealTps. */
        private minFrameTime;
        /** Accumulated time since last update. Used for fixed time step updates. */
        private accumulatedTime;
        /** Maximum number of updates per frame. */
        private maxUpdatesPerFrame;
        /** Whether to enable frame skipping for slow devices. */
        private enableFrameSkipping;
        /** Number of frames to skip when behind. Helps maintain performance. */
        private framesToSkip;
        /** Whether to log performance info to console. */
        private logPerformanceInfo;
        /** Whether the game loop should stop. */
        private stopVal;
        /** Whether the game has been initialized. */
        private hasInited;
        /** Whether the game has loaded all assets. */
        private hasLoadedAssets;
        /** Function called every frame when updating the game. */
        private update;
        /** Function called to initialize the game. */
        private initFunc;
        /**
         * Initializes default values for performance monitoring and game loop settings.
         * Sets up the engine with reasonable defaults for most games.
         */
        constructor();
        /**
         * Initializes the game engine with the provided settings.
         * Sets up the render loop, game state management, and event handling.
         *
         * @param engineSettings - Configuration object containing all necessary engine components
         * @throws Error if required components are missing or invalid
         */
        init(engineSettings: EngineSettings): void;
        /**
         * Starts the main game loop.
         * @private
         */
        private startLoop;
        /**
         * Starts the performance tracker to monitor frame rate and ticks per second;
         * updates FPS and TPS counters every second. Logs performance info to the console.
         */
        private startPerformanceTracker;
        /**
         * Stops the game engine loop.
         */
        stop(): void;
        /**
         * Starts or resumes the game engine loop.
         * Resets timing variables.
         */
        start(): void;
        /**
         * Gets the performance info.
         * @returns The performance info object
         */
        getPerformanceInfo(): {
            fps: number;
            tps: number;
            idealTps: number;
            minFrameTime: number;
            accumulatedTime: number;
        };
        /**
         * Gets the current frames per second.
         * @returns The current FPS value
         */
        getFps(): number;
        /**
         * Gets the current ticks per second.
         * @returns The current TPS value
         */
        getTps(): number;
        /**
         * Sets whether to log the performance info.
         * @param _val - Whether to log the performance info
         */
        setLoggingPerformanceInfo(_val: boolean): void;
        /**
         * Gets whether the engine is logging performance info.
         * @returns Whether the engine is logging performance info
         */
        isLoggingPerformanceInfo(): boolean;
        /**
         * Gets the ideal ticks per second.
         * @returns The ideal TPS value
         */
        getIdealTps(): number;
        /**
         * Sets the ideal ticks per second.
         * @param _val - The ideal TPS value
         */
        setIdealTps(_val: number): void;
        /**
         * Sets whether to enable frame skipping.
         * @param _val - Whether to enable frame skipping
         */
        setEnableFrameSkipping(_val: boolean): void;
        /**
         * Gets whether frame skipping is enabled.
         * @returns Whether frame skipping is enabled
         */
        getEnableFrameSkipping(): boolean;
    }
    /**
     * Handles the rendering of the game.
     */
    class Render {
        /** The Canvas Element */
        private canvas;
        /** The WebGL Context */
        private ctx;
        /** The Shader Program */
        private shaderProgram;
        /** The Vertex Array Object */
        private vao;
        /** The Position Buffer */
        private positionBuffer;
        /** The Color Buffer */
        private colorBuffer;
        /** The Texcoord Buffer */
        private texcoordBuffer;
        /** The Position Attribute Location */
        private aPosition;
        /** The Color Attribute Location */
        private aColor;
        /** The Texcoord Attribute Location */
        private aTexcoord;
        /** The Projection Uniform Location */
        private uProjection;
        /** The Model Uniform Location */
        private uModel;
        /** The View Uniform Location */
        private uView;
        /** The Rotation Uniform Location */
        private uRotation;
        /** The Alpha Uniform Location */
        private uAlpha;
        /** The Vertex Shader Source */
        private vertexShaderSource;
        /** Eclipse Segments */
        private eclipseSegments;
        /** The Scale */
        private scale;
        /** The Full Screen Ratio */
        private fullScreenRatio;
        /** The Draw Function */
        private draw;
        /**
         * Constructor for the Render class.
         * @param canvas - The HTMLCanvasElement to render on
         * @param draw - The function to draw on the canvas
         * @param scale - The scale of the canvas
         */
        constructor(canvas: HTMLCanvasElement, draw: () => void, scale: number);
        /**
         * Returns a function that draws the game on the canvas.
         * @returns The draw function
         */
        drawFunction(): () => void;
        /**
         * Draws a sprite on the canvas.
         * @param object - The sprite to draw
         */
        private drawSprite;
        /**
         * Draws a particle on the canvas.
         * @param particle - The particle to draw
         */
        private drawParticle;
        /**
         * Converts hex color string to RGB array.
         * @param hex - The hex color
         * @returns The RGB color
         */
        private hexToRgb;
        /**
         * Draws a rectangle on the canvas.
         * @param x - X position
         * @param y - Y position
         * @param width - Width
         * @param height - Height
         * @param color - Color
         * @param alpha - Alpha
         * @param rotation - Rotation
         */
        private drawRect;
        /**
         * Draws an image on the canvas.
         * @param x - The x position
         * @param y - The y position
         * @param width - The width
         * @param height - The height
         * @param image - The image to draw
         * @param alpha - Alpha
         * @param rotation - Rotation
         */
        private drawImage;
        /**
         * Draws an eclipse on the canvas.
         * @param x - The x position
         * @param y - The y position
         * @param width - The width
         * @param height - The height
         * @param color - The color
         * @param alpha - Alpha
         * @param rotation - Rotation
         */
        private drawEclipse;
        /**
         * Creates the eclipse vertices.
         * @param cx - The x position
         * @param cy - The y position
         * @param rx - The x radius
         * @param ry - The y radius
         * @param segments - The segments
         * @returns The vertices
         */
        private createEclipseVertices;
        /**
         * Orthographic projection.
         * @param left - The left
         * @param right - The right
         * @param bottom - The bottom
         * @param top - The top
         * @returns The orthographic projection
         */
        private orthographic;
        /**
         * Ajusts the canvas to the window size without a set ratio.
         */
        ajustCanvas(): void;
        /**
         * Ajusts the canvas to the window size with a set ratio.
         * @param xRatio - The x ratio
         * @param yRatio - The y ratio
         */
        ajustCanvasRatio(xRatio: number, yRatio: number): void;
        /**
         * Gets the canvas.
         * @returns The canvas
         */
        getCanvas(): HTMLCanvasElement;
        /**
         * Gets the width of the canvas.
         * @returns The width of the canvas
         */
        getWidth(): number;
        /**
         * Gets the height of the canvas.
         * @returns The height of the canvas
         */
        getHeight(): number;
        /**
         * Gets the context of the canvas.
         * @returns The context of the canvas
         */
        getCtx(): WebGL2RenderingContext;
        /**
         * Gets the scale of the canvas.
         * @returns The scale of the canvas
         */
        getScale(): number;
        /**
         * Gets the eclipse segments.
         * @returns The eclipse segments
         */
        getEclipseSegments(): number;
        /**
         * Sets the eclipse segments.
         * @param segments - The segments
         */
        setEclipseSegments(segments: number): void;
        /**
         * Gets the full screen ratios.
         * @returns The full screen ratios
         */
        getAdjustedCanvasRatios(): [number, number] | null;
    }
    /** Handles the loading of game assets. */
    class Loader {
        /** Image assets */
        private images;
        /** Audio assets */
        private audio;
        /** The number of assets to load */
        private assetsToLoad;
        /**
         * Constructor for the Loader class.
         */
        constructor();
        /**
         * Loads an image.
         * @param id - The id of the image
         * @param src - The source of the image
         */
        loadImage(id: string, src: string): void;
        /**
         * Loads an audio.
         * @param id - The id of the audio
         * @param src - The source of the audio
         */
        loadAudio(id: string, src: string): void;
        /**
         * Gets the loaded image by id.
         * @param id - The id of the image
         * @returns The loaded image
         */
        getLoadedImageById: (id: string) => WebGLTexture;
        /**
         * Gets the loaded audio by id.
         * @param id - The id of the audio
         * @returns The loaded audio
         */
        getLoadedAudioById: (id: string) => HTMLAudioElement;
        /**
         * Gets the number of assets to load.
         * @returns The number of assets to load
         */
        getNumberOfAssetsToLoad(): number;
    }
    /** Handles the events of the game. */
    export interface Events {
        /** The mouse event */
        mouseEvent: MouseEvent | null;
        /** The touch event */
        touchEvent: TouchEvent | null;
        /** Whether the mouse is down */
        isMouseDown: boolean;
        /** Whether the touch is down */
        isTouchDown: boolean;
        /** Handles the on key down event */
        onKeyDown(e: KeyboardEvent): void;
        /** Handles the on key up event */
        onKeyUp(e: KeyboardEvent): void;
        /** Handles the mouse down event */
        mouseDown(e: MouseEvent): void;
        /** Handles the mouse up event */
        mouseUp(e: MouseEvent): void;
        /** Handles the mouse move event */
        mouseMove(e: MouseEvent): void;
        /** Handles the touch start event */
        touchStart(e: TouchEvent): void;
        /** Handles the touch end event */
        touchEnd(e: TouchEvent): void;
        /** Handles the touch move event */
        touchMove(e: TouchEvent): void;
        /** Handles the while mouse down event */
        whileMouseDown(e: MouseEvent): void;
        /** Handles the while touch down event */
        whileTouchDown(e: TouchEvent): void;
    }
    /** Handles game controls. */
    class Controller {
        /** Dictionary of currently pressed keys */
        private keysDown;
        /** Unajusted mouse X coordinate */
        private mouseClientX;
        /** Unajusted mouse Y coordinate */
        private mouseClientY;
        /** Unajusted touch X coordinate */
        private touchClientX;
        /** Unajusted touch Y coordinate */
        private touchClientY;
        /** Mouse X coordinate */
        private mouseX;
        /** Mouse Y coordinate */
        private mouseY;
        /** Touch X coordinate */
        private touchX;
        /** Touch Y coordinate */
        private touchY;
        /** Event object */
        private eventObj;
        /**
         * Constructor for the Controller class.
         * @param render - The render object
         * @param events - The events object
         */
        constructor(render: Render, engine: Engine, events: Events);
        /**
         * Gets the key state.
         * @param key - The key to get the state of
         * @returns The key state
         */
        getKey(key: string): boolean;
        /**
         * Gets the mouse X coordinate.
         * @returns The mouse X coordinate
         */
        getMouseX(): number | null;
        /**
         * Gets the mouse Y coordinate.
         * @returns The mouse Y coordinate
         */
        getMouseY(): number | null;
        /**
         * Gets the touch X coordinate.
         * @returns The touch X coordinate
         */
        getTouchX(): number | null;
        /**
         * Gets the touch Y coordinate.
         * @returns The touch Y coordinate
         */
        getTouchY(): number | null;
        /**
         * Gets the mouse down state.
         * @returns The mouse down state
         */
        getIsMouseDown(): boolean;
        /**
         * Gets the touch down state.
         * @returns The touch down state
         */
        getIsTouchDown(): boolean;
    }
    /** Handles the game state. */
    class Game {
        /** Array of all sprites in the game */
        private sprites;
        /** Array of all particles in the game */
        private particles;
        /** The background image of the game */
        private background;
        /** The map reader image of the game */
        private mapReaderImage;
        /** The map reader canvas of the game */
        private mapReaderCanvas;
        /**
         * Creates a new game instance.
         * Initializes an empty array of sprites, particles, background, and map reader image and canvas.
         */
        constructor();
        /**
         * Sorts the sprites by stage level.
         * @param arr - The array of sprites to sort
         * @returns The sorted array of sprites
         */
        private sortSprites;
        /**
         * Creates a map from an image.
         * @param func - The function to call for each pixel
         */
        private createMapFromImage;
        /**
         * Uses an image to create a map.
         * @param image - The image to create the map from
         * @param func - The function to call for each pixel
         */
        useImageToCreateMap(image: HTMLImageElement, func: (data: Uint8ClampedArray, x: number, y: number) => void): void;
        /**
         * Gets the image data at a location.
         * @param x - The x coordinate
         * @param y - The y coordinate
         * @returns The image data
         */
        getMapImageDataAtLocation(x: number, y: number): ImageData;
        /**
         * Adds a new sprite to the game.
         * @param sprites - The sprite to add
         */
        addNewSprite(sprites: Sprite | Sprite[]): void;
        /**
         * Adds a new particle to the game.
         * @param particle - The particle to add
         */
        addParticle(particle: Particle | Particle[]): void;
        /**
         * Gets a sprite by its id.
         * @param id - The id of the sprite
         * @returns The sprite
         */
        getSpriteById: (id: string) => Sprite;
        /**
         * Gets a particle by its id.
         * @param id - The id of the particle
         * @returns The particle
         */
        getParticleById: (id: string) => Particle;
        /**
         * Gets sprites by type.
         * @param constructor - The constructor of the sprite
         * @returns The sprites
         */
        getSpritesByType<T extends Sprite>(constructor: new (...args: any[]) => T): T[];
        /**
         * Gets particles by type.
         * @param constructor - The constructor of the particle
         * @returns The particles
         */
        getParticlesByType<T extends Particle>(constructor: new (...args: any[]) => T): T[];
        /**
         * Deletes a sprite by its id.
         * @param id - The id of the sprite
         */
        deleteSpriteById: (id: string) => Sprite[];
        /**
         * Deletes a particle by its id.
         * @param id - The id of the particle
         */
        deleteParticleById: (id: string) => Particle[];
        /**
         * Deletes sprites by type.
         * @param type - The type of the sprite
         */
        deleteSpritesByType: (type: any) => Sprite[];
        /**
         * Deletes particles by type.
         * @param type - The type of the particle
         */
        deleteParticlesByType: (type: any) => Particle[];
        /**
         * Deletes all sprites.
         */
        deleteSprites: () => void;
        /**
         * Deletes all particles.
         */
        deleteParticles: () => void;
        /**
         * Sets a dynamic background image.
         * @param image - The image to set
         * @param x - The x coordinate
         * @param y - The y coordinate
         * @param width - The width of the image
         * @param height - The height of the image
         */
        setDynamicBackgroundImage(image: HTMLImageElement, x: number, y: number, width: number, height: number): void;
        /**
         * Sets a static background image.
         * @param image - The image to set
         */
        setStaticBackgroundImage: (image: HTMLImageElement) => void;
        /**
         * Gets the background image.
         * @returns The background image
         */
        getBackgroundImage(): HTMLImageElement | null;
        /**
         * Gets the sprites.
         * @returns The sprites
         */
        getSprites(): Sprite[];
        /**
         * Gets the particles.
         * @returns The particles
         */
        getParticles(): Particle[];
    }
    /** Handles the camera. */
    class Camera {
        /** The x coordinate */
        private x;
        /** The y coordinate */
        private y;
        /** The sprite to follow */
        private toFollow;
        /**
         * Constructor for the Camera class.
         */
        constructor();
        /**
         * Sets the sprite to follow.
         * @param _val - The sprite to follow
         */
        setToFollow(_val: Sprite | null): void;
        /**
         * Gets the sprite to follow.
         * @returns The sprite to follow
         */
        getToFollow(): Sprite | null;
        /**
         * Goes to a location.
         * @param _valx - The x coordinate
         * @param _valy - The y coordinate
         */
        goTo(_valx: number, _valy: number): void;
        /**
         * Gets the x coordinate.
         * @returns The x coordinate
         */
        getX(): number;
        /**
         * Sets the x coordinate.
         * @param _val - The x coordinate
         */
        setX(_val: number): void;
        /**
         * Gets the y coordinate.
         * @returns The y coordinate
         */
        getY(): number;
        /**
         * Sets the y coordinate.
         * @param _val - The y coordinate
         */
        setY(_val: number): void;
        /**
         * Gets the width.
         * @returns The width
         */
        getWidth(): () => number;
        /**
         * Gets the height.
         * @returns The height
         */
        getHeight(): () => number;
    }
    /**
     * Base class for all game objects in the engine.
     * Provides common functionality for position, size, and basic game object behavior.
     * All game objects (sprites, particles, etc.) inherit from this class.
     */
    class GameObject {
        /** Unique identifier for the game object */
        private id;
        /** X coordinate of the game object's position */
        private x;
        /** Y coordinate of the game object's position */
        private y;
        /** Width of the game object */
        private width;
        /** Height of the game object */
        private height;
        /** Color of the game object in hexadecimal format */
        private color;
        /**
         * Creates a new game object with the specified properties.
         *
         * @param id - Unique identifier for the game object
         * @param x - Initial x coordinate
         * @param y - Initial y coordinate
         * @param width - Width of the game object
         * @param height - Height of the game object
         * @param color - Color in hexadecimal format (e.g., "#FF0000" for red)
         * @throws Error if a game object with the same id already exists
         */
        constructor(id: string, x: number, y: number, width: number, height: number, color: string);
        /**
         * Updates the game object's state.
         * Called every game tick. Override this method to implement custom update logic.
         */
        update(): void;
        /**
         * Draws the game object.
         * Called every frame. Override this method to implement custom drawing logic.
         */
        draw(): void;
        /**
         * Checks if the game object is currently visible on screen.
         * Takes into account the camera position and viewport size.
         *
         * @returns true if any part of the game object is visible on screen
         */
        isOnScreen(): boolean;
        /**
         * Moves the game object to the specified position.
         *
         * @param x - New x coordinate
         * @param y - New y coordinate
         */
        goTo(x: number, y: number): void;
        /**
         * Moves the game object to a predefined screen position.
         *
         * @param place - The screen position to move to
         * @throws Error if an invalid screen place is specified
         */
        to(place: ScreenPlaces): void;
        /**
         * Gets the unique identifier of the game object.
         *
         * @returns The game object's id
         */
        getId(): string;
        /**
         * Sets a new unique identifier for the game object.
         *
         * @param id - The new id
         * @throws Error if a game object with the same id already exists
         */
        setId(id: string): void;
        /**
         * Gets the x coordinate of the game object.
         *
         * @returns The x coordinate
         */
        getX(): number;
        /**
         * Sets the x coordinate of the game object.
         *
         * @param x - The new x coordinate
         */
        setX(x: number): void;
        /**
         * Gets the y coordinate of the game object.
         *
         * @returns The y coordinate
         */
        getY(): number;
        /**
         * Sets the y coordinate of the game object.
         *
         * @param y - The new y coordinate
         */
        setY(y: number): void;
        /**
         * Gets the width of the game object.
         *
         * @returns The width
         */
        getWidth(): number;
        /**
         * Sets the width of the game object.
         *
         * @param width - The new width
         */
        setWidth(width: number): void;
        /**
         * Gets the height of the game object.
         *
         * @returns The height
         */
        getHeight(): number;
        /**
         * Sets the height of the game object.
         *
         * @param height - The new height
         */
        setHeight(height: number): void;
        /**
         * Gets the color of the game object.
         *
         * @returns The color in hexadecimal format
         */
        getColor(): string;
        /**
         * Sets the color of the game object.
         *
         * @param color - The new color in hexadecimal format
         */
        setColor(color: string): void;
    }
    /**
     * A sprite is a game object that can have costumes, effects, and collision detection.
     * Sprites are the main interactive elements in a game.
     */
    export class Sprite extends GameObject {
        /** The layer level of the sprite (determines drawing order) */
        private stageLevel;
        /** Manages the sprite's costumes (appearances) */
        private costumes;
        /** Manages the sprite's visual effects */
        private effects;
        /** Handles collision detection for the sprite */
        private collision;
        /**
         * Creates a new sprite with the specified properties.
         *
         * @param id - Unique identifier for the sprite
         * @param x - Initial x coordinate
         * @param y - Initial y coordinate
         * @param width - Width of the sprite
         * @param height - Height of the sprite
         * @param color - Default color in hexadecimal format
         * @param stageLevel - The layer level (0 is bottom, higher numbers are drawn on top)
         * @throws Error if a sprite with the same id already exists
         */
        constructor(id: string, x: number, y: number, width: number, height: number, color: string, stageLevel: number);
        /**
         * Gets the stage level of the sprite.
         *
         * @returns The stage level (0 is bottom, higher numbers are drawn on top)
         */
        getStageLevel(): number;
        /**
         * Sets the stage level of the sprite.
         *
         * @param stageLevel - The new stage level
         */
        setStageLevel(stageLevel: number): void;
        /**
         * Gets the effects manager for this sprite.
         *
         * @returns The Effects object managing this sprite's visual effects
         */
        getEffect(): Effects;
        /**
         * Gets the costumes manager for this sprite.
         *
         * @returns The Costumes object managing this sprite's appearances
         */
        getCostumes(): Costumes;
        /**
         * Gets the collision manager for this sprite.
         *
         * @returns The Collision object handling this sprite's collision detection
         */
        getCollision(): Collision;
    }
    /**
     * Manages visual effects for game objects.
     * Handles properties like visibility, transparency, rotation, and shape effects.
     */
    class Effects {
        /** Whether the game object is hidden (not rendered) */
        private hidden;
        /** Transparency level (0-100, where 0 is fully visible and 100 is fully transparent) */
        private transparency;
        /** Rotation angle in degrees (0-360) */
        private rotation;
        /** Whether the game object should be rendered as an ellipse instead of a rectangle */
        private isEclipse;
        /**
         * Creates a new Effects manager with default values.
         * Default values:
         * - visible (not hidden)
         * - fully opaque (0% transparency)
         * - no rotation (0 degrees)
         * - rectangular shape (not an ellipse)
         */
        constructor();
        /**
         * Resets all effects to their default values.
         * Makes the game object visible, fully opaque, unrotated, and rectangular.
         */
        clearEffects(): void;
        /**
         * Gets whether the game object is hidden.
         *
         * @returns true if the game object is hidden, false if visible
         */
        getHidden(): boolean;
        /**
         * Sets whether the game object is hidden.
         *
         * @param hidden - true to hide the game object, false to show it
         */
        setHidden(hidden: boolean): void;
        /**
         * Gets the transparency level of the game object.
         *
         * @returns The transparency level (0-100)
         */
        getTransparency(): number;
        /**
         * Sets the transparency level of the game object.
         *
         * @param transparency - The new transparency level (0-100)
         * @throws Error if transparency is not between 0 and 100
         */
        setTransparency(transparency: number): void;
        /**
         * Gets the rotation angle of the game object.
         *
         * @returns The rotation angle in degrees (0-360)
         */
        getRotation(): number;
        /**
         * Sets the rotation angle of the game object.
         *
         * @param rotation - The new rotation angle in degrees
         */
        setRotation(rotation: number): void;
        /**
         * Gets whether the game object is rendered as an ellipse.
         *
         * @returns true if the game object is an ellipse, false if it's a rectangle
         */
        getIsEclipse(): boolean;
        /**
         * Sets whether the game object should be rendered as an ellipse.
         *
         * @param isEclipse - true to render as an ellipse, false to render as a rectangle
         */
        setIsEclipse(isEclipse: boolean): void;
    }
    /**
     * Manages costumes (appearances) for sprites.
     * Handles multiple costumes and switching between them.
     */
    class Costumes {
        /** Map of costume IDs to their corresponding textures */
        private costumes;
        /** ID of the currently active costume */
        private id;
        /**
         * Creates a new Costumes manager with a default "NONE" costume.
         * The "NONE" costume is a special costume that represents no texture.
         */
        constructor();
        /**
         * Adds a new costume to the sprite.
         *
         * @param id - Unique identifier for the costume
         * @param texture - The WebGL texture for the costume, or null for no texture
         * @throws Error if the costume ID is "NONE" (reserved)
         */
        addCostume(id: string, texture: WebGLTexture | null): void;
        /**
         * Sets the active costume by its ID.
         *
         * @param id - The ID of the costume to activate
         */
        setCostumeById(id: string): void;
        /**
         * Gets the currently active costume's texture.
         *
         * @returns The WebGL texture of the active costume, or null if no texture
         */
        getCostume(): WebGLTexture | null;
        /**
         * Gets the WebGL texture of the currently active costume.
         *
         * @returns The WebGL texture, or null if no texture is set
         */
        getTexture(): WebGLTexture | null;
    }
    /** Handles the collision of the sprite. */
    class Collision {
        /** The sprite this collision manager belongs to */
        private me;
        /**
         * Creates a new collision manager for a sprite.
         *
         * @param sprite - The sprite this collision manager belongs to
         */
        constructor(me: Sprite);
        /**
         * Gets all sprites touching the self sprite.
         * @returns All sprites touching the self sprite
         */
        touchingSprite: () => Sprite[];
        /**
         * Checks if the self sprite is touching another sprite.
         * @param other - The other sprite
         * @returns Whether the self sprite is touching the other sprite
         */
        touching(other: Sprite): boolean;
        /**
         * Gets all sprites above the self sprite.
         * @returns All sprites above the self sprite
         */
        getSpriteAboveSelf(): Sprite[];
        /**
         * Gets all sprites below the self sprite.
         * @returns All sprites below the self sprite
         */
        getSpriteBelowSelf(): Sprite[];
        /**
         * Gets all sprites to the left of the self sprite.
         * @returns All sprites to the left of the self sprite
         */
        getSpriteLeftSelf(): Sprite[];
        /**
         * Gets all sprites to the right of the self sprite.
         * @returns All sprites to the right of the self sprite
         */
        getSpriteRightSelf(): Sprite[];
    }
    /** A particle game object that can be extended to create your own particles. */
    export class Particle extends GameObject {
        /** The effects of the particle */
        private effects;
        /**
         * Constructor for the Particle class.
         * @param id - The id of the particle
         * @param x - The x position of the particle
         * @param y - The y position of the particle
         * @param width - The width of the particle
         * @param height - The height of the particle
         * @param color - The color of the particle in hexadecimal format
         */
        constructor(id: string, x: number, y: number, width: number, height: number, color: string);
        /**
         * Gets the effects of the particle.
         * @returns The effects of the particle
         */
        getEffects(): Effects;
    }
    /** Platformer Sprite; Contains movement and collision features. */
    export class Platformer extends Sprite {
        /** The velocity of the sprite on the x axis. */
        private vx;
        /** The speed of the sprite on the x axis. */
        private vxSpeed;
        /** The maximum velocity of the sprite on the x axis. */
        private maxVX;
        /** The velocity of the sprite on the y axis. */
        private vy;
        /** The speed of the sprite on the y axis. */
        private vySpeed;
        /** The maximum velocity of the sprite on the y axis. */
        private maxVY;
        /** The gravity acceleration of the sprite. */
        private gravityAcc;
        /** Whether the sprite has a platformer below it. */
        private hasPlatformerBelow;
        /** Whether to check all platformers. */
        private checkAllPlatformers;
        /** The platformers to check collision with. */
        private platformersToCheckCollision;
        /**
         * Constructor for the Platformer class.
         * @param id - The id of the sprite
         * @param x - The x position of the sprite
         * @param y - The y position of the sprite
         * @param width - The width of the sprite
         * @param height - The height of the sprite
         * @param color - The color of the sprite
         * @param stageLevel - The stage level of the sprite
         */
        constructor(id: string, x: number, y: number, width: number, height: number, color: string, stageLevel: number);
        /**
         * Applies gravity to the platformer sprite.
         */
        doGravity(): void;
        /**
         * Moves the platformer sprite on the x axis.
         * @param x - The amount to move the sprite on the x axis
         */
        moveX(x: number): void;
        /**
         * Moves the platformer sprite on the y axis.
         * @param y - The amount to move the sprite on the y axis
         */
        moveY(y: number): void;
        /**
         * Makes the platformer sprite jump.
         * @param jumpHeight - The height of the jump
         */
        doJump(jumpHeight: number): void;
        /**
         * Gets all platformers above the platformer sprite.
         * @returns All platformers above the platformer sprite
         */
        getPlatformerAboveSelf(): Platformer[];
        /**
         * Gets all platformers below the platformer sprite.
         * @returns All platformers below the platformer sprite
         */
        getPlatformerBelowSelf(): Platformer[];
        /**
         * Gets all platformers to the left of the platformer sprite.
         * @returns All platformers to the left of the platformer sprite
         */
        getPlatformerLeftSelf(): Platformer[];
        /**
         * Gets all platformers to the right of the platformer sprite.
         * @returns All platformers to the right of the platformer sprite
         */
        getPlatformerRightSelf(): Platformer[];
        /**
         * Adds friction to the platformer sprite on the x axis.
         * @param friction - The friction to add
         */
        addFrictionX(friction: number): void;
        /**
         * Adds friction to the platformer sprite on the y axis.
         * @param friction - The friction to add
         */
        addFrictionY(friction: number): void;
        /**
         * Gets the velocity of the platformer sprite on the x axis.
         * @returns The velocity of the platformer sprite on the x axis
         */
        getVX(): number;
        /**
         * Sets the velocity of the platformer sprite on the x axis.
         * @param _val - The velocity to set
         */
        setVX(_val: number): void;
        /**
         * Gets the speed of the platformer sprite on the x axis.
         * @returns The speed of the platformer sprite on the x axis
         */
        getVXSpeed(): number;
        /**
         * Sets the speed of the platformer sprite on the x axis.
         * @param _val - The speed to set
         */
        setVXSpeed(_val: number): void;
        /**
         * Gets the maximum velocity of the platformer sprite on the x axis.
         * @returns The maximum velocity of the platformer sprite on the x axis
         */
        getMaxVX(): number | null;
        /**
         * Sets the maximum velocity of the platformer sprite on the x axis.
         * @param _val - The maximum velocity to set
         */
        setMaxVX(_val: number | null): void;
        /**
         * Gets the velocity of the platformer sprite on the y axis.
         * @returns The velocity of the platformer sprite on the y axis
         */
        getVY(): number;
        /**
         * Sets the velocity of the platformer sprite on the y axis.
         * @param _val - The velocity to set
         */
        setVY(_val: number): void;
        /**
         * Gets the speed of the platformer sprite on the y axis.
         * @returns The speed of the platformer sprite on the y axis
         */
        getVYSpeed(): number;
        /**
         * Sets the speed of the platformer sprite on the y axis.
         * @param _val - The speed to set
         */
        setVYSpeed(_val: number): void;
        /**
         * Gets the maximum velocity of the platformer sprite on the y axis.
         * @returns The maximum velocity of the platformer sprite on the y axis
         */
        getMaxVY(): number | null;
        /**
         * Sets the maximum velocity of the platformer sprite on the y axis.
         * @param _val - The maximum velocity to set
         */
        setMaxVY(_val: number | null): void;
        /**
         * Gets the gravity acceleration of the platformer sprite.
         * @returns The gravity acceleration of the platformer sprite
         */
        getGravityAcc(): number;
        /**
         * Sets the gravity acceleration of the platformer sprite.
         * @param _val - The gravity acceleration to set
         */
        setGravityAcc(_val: number): void;
        /**
         * Gets the platformers to check collision with.
         * @returns The platformers to check collision with
         */
        getPlatformersToCheckCollision(): Platformer[];
        /**
         * Sets the platformers to check collision with.
         * @param _val - The platformers to check collision with
         */
        setPlatformerSpritesToCheckCollisionWith(_val: Platformer[]): void;
    }
    /** The places on the screen. */
    export enum ScreenPlaces {
        center = 0,
        verticalCenter = 1,
        horizontalCenter = 2,
        randomPosition = 3
    }
    /**
     * Gets the engine instance.
     * @returns The engine instance
     */
    export const getEngine: () => Engine;
    /**
     * Gets the render instance.
     * @returns The render instance
     */
    export let getRender: () => Render;
    /**
     * Gets the loader instance.
     * @returns The loader instance
     */
    export let getLoader: () => Loader;
    /**
     * Gets the events instance.
     * @returns The events instance
     */
    export let getEvents: () => Events;
    /**
     * Gets the controller instance.
     * @returns The controller instance
     */
    export let getController: () => Controller;
    /**
     * Gets the game instance.
     * @returns The game instance
     */
    export let getGame: () => Game;
    /**
     * Gets the camera instance.
     * @returns The camera instance
     */
    export let getCamera: () => Camera;
    /**
     * Initializes the engine.
     * @param engineSettings - The engine settings
     */
    export let init: (engineSettings: EngineSettings) => void;
    export {  };
}

export { Neutron };
