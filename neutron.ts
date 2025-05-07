/*
 * ███╗   ██╗███████╗██╗   ██╗████████╗██████╗  ██████╗ ███╗   ██╗
 * ████╗  ██║██╔════╝██║   ██║╚══██╔══╝██╔══██╗██╔═══██╗████╗  ██║
 * ██╔██╗ ██║█████╗  ██║   ██║   ██║   ██████╔╝██║   ██║██╔██╗ ██║
 * ██║╚██╗██║██╔══╝  ██║   ██║   ██║   ██╔══██╗██║   ██║██║╚██╗██║
 * ██║ ╚████║███████╗╚██████╔╝   ██║   ██║  ██║╚██████╔╝██║ ╚████║
 * ╚═╝  ╚═══╝╚══════╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
 */

/**
 * Neutron namespace provides a game engine framework for creating interactive applications;
 * includes core functionality for rendering, game state management, and event handling and more.
 */
export namespace Neutron {
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
    private fps: number;
    /** Current ticks per second. Updated every second. */
    private tps: number;
    /** Counter for FPS (frames per second) calculation. Reset every second. */
    private fpsCounter: number;
    /** Counter for TPS (ticks per second) calculation. Reset every second. */
    private tpsCounter: number;
    /** Target ticks per second for the game loop. Controls game speed. */
    private idealTps: number;
    /** Timestamp of the last update. Used for delta time calculation. */
    private lastUpdateTime: number;
    /** Minimum time between updates in milliseconds. Based on idealTps. */
    private minFrameTime: number;
    /** Accumulated time since last update. Used for fixed time step updates. */
    private accumulatedTime: number;
    /** Maximum number of updates per frame. */
    private maxUpdatesPerFrame: number;
    /** Whether to enable frame skipping for slow devices. */
    private enableFrameSkipping: boolean;
    /** Number of frames to skip when behind. Helps maintain performance. */
    private framesToSkip: number;
    /** Whether to log performance info to console. */
    private logPerformanceInfo: boolean;
    /** Whether the game loop should stop. */
    private stopVal: boolean;
    /** Whether the game has been initialized. */
    private hasInited: boolean;
    /** Whether the game has loaded all assets. */
    private hasLoadedAssets: boolean;
    /** Function called every frame when updating the game. */
    private update: () => void;
    /** Function called to initialize the game. */
    private initFunc: () => void;

    /**
     * Initializes default values for performance monitoring and game loop settings.
     * Sets up the engine with reasonable defaults for most games.
     */
    constructor() {
      this.fps = 0;
      this.tps = 0;
      this.fpsCounter = 0;
      this.tpsCounter = 0;
      this.idealTps = 70;
      this.lastUpdateTime = performance.now();
      this.minFrameTime = 1000 / this.idealTps;
      this.accumulatedTime = 0;
      this.maxUpdatesPerFrame = 5;
      this.enableFrameSkipping = true;
      this.framesToSkip = 1;
      this.logPerformanceInfo = false;
      this.stopVal = false;
      this.hasInited = false;
      this.hasLoadedAssets = false;
      this.update = () => {};
      this.initFunc = () => {};
    }

    /**
     * Initializes the game engine with the provided settings.
     * Sets up the render loop, game state management, and event handling.
     *
     * @param engineSettings - Configuration object containing all necessary engine components
     * @throws Error if required components are missing or invalid
     */
    init(engineSettings: EngineSettings): void {
      const render = new Render(
        engineSettings.canvas,
        engineSettings.draw,
        engineSettings.scale
      );
      const loader = new Loader();
      const events = engineSettings.events;
      const controller = new Controller(render, this, events);
      const game = new Game();
      const camera = new Camera();

      getRender = () => render;
      getLoader = () => loader;
      getEvents = () => events;
      getController = () => controller;
      getGame = () => game;
      getCamera = () => camera;

      this.idealTps = engineSettings.tps;
      this.minFrameTime = 1000 / this.idealTps;
      this.initFunc = engineSettings.init;

      this.update = () => {
        getGame()
          .getParticles()
          .forEach((particle: Particle) => particle.update());

        getGame()
          .getSprites()
          .forEach((sprite: Sprite) => sprite.update());

        const camera = getCamera();
        if (camera.getToFollow() !== null) {
          const toFollow = camera.getToFollow() as Sprite;
          camera.setX(toFollow.getX() - getRender().getWidth() / 2);
          camera.setY(toFollow.getY() - getRender().getHeight() / 2);
        }

        if (events.isMouseDown && events.mouseEvent) {
          events.whileMouseDown(events.mouseEvent);
        }

        engineSettings.update();
      };

      engineSettings.load();

      if (getLoader().getNumberOfAssetsToLoad() !== 0) {
        this.hasLoadedAssets = true;
      }

      this.startLoop();
      this.startPerformanceTracker();
    }

    /**
     * Starts the main game loop.
     * @private
     */
    private startLoop = (): void => {
      if (this.stopVal) {
        return;
      }

      if (getLoader().getNumberOfAssetsToLoad() === 0) {
        this.hasLoadedAssets = false;
      }

      if (this.hasLoadedAssets) {
        window.requestAnimationFrame(this.startLoop);
        return;
      }

      if (!this.hasInited) {
        this.initFunc();
        this.hasInited = true;
      }

      this.fpsCounter++;

      const currentTime = performance.now();
      const deltaTime = currentTime - this.lastUpdateTime;
      this.lastUpdateTime = currentTime;
      this.accumulatedTime += deltaTime;

      let updates = 0;
      while (
        this.accumulatedTime >= this.minFrameTime &&
        updates < this.maxUpdatesPerFrame
      ) {
        this.update();
        this.tpsCounter++;
        this.accumulatedTime -= this.minFrameTime;
        updates++;
      }

      if (
        this.enableFrameSkipping &&
        this.accumulatedTime > this.minFrameTime * this.framesToSkip
      ) {
        this.accumulatedTime = 0;
      } else if (this.accumulatedTime > this.minFrameTime * 5) {
        this.accumulatedTime = this.minFrameTime * 5;
      }

      getRender().drawFunction()();

      window.requestAnimationFrame(this.startLoop);
    };

    /**
     * Starts the performance tracker to monitor frame rate and ticks per second;
     * updates FPS and TPS counters every second. Logs performance info to the console.
     */
    private startPerformanceTracker = (): void => {
      setInterval(() => {
        this.fps = this.fpsCounter;
        this.tps = this.tpsCounter;
        this.fpsCounter = 0;
        this.tpsCounter = 0;

        if (this.logPerformanceInfo) {
          console.log(
            `%cNeutron Performance Info\n%cFPS: %c${this.fps}%c | TPS: %c${this.tps}%c | Target TPS: %c${this.idealTps}%c\nMin Frame Time: %c${this.minFrameTime}ms%c | Accumulated Time: %c${this.accumulatedTime}ms`,
            "font-weight: bold; font-size: 14px; color: #4CAF50;",
            "color: #888;",
            "color: #2196F3; font-weight: bold;",
            "color: #888;",
            "color: #2196F3; font-weight: bold;",
            "color: #888;",
            "color: #2196F3; font-weight: bold;",
            "color: #888;",
            "color: #FF9800; font-weight: bold;",
            "color: #888;",
            "color: #FF9800; font-weight: bold;"
          );
        }
      }, 1000);
    };

    /**
     * Stops the game engine loop.
     */
    stop(): void {
      this.stopVal = true;
    }

    /**
     * Starts or resumes the game engine loop.
     * Resets timing variables.
     */
    start(): void {
      if (this.stopVal) {
        this.stopVal = false;
        this.lastUpdateTime = performance.now();
        this.accumulatedTime = 0;
        this.startLoop();
      }
    }

    /**
     * Gets the performance info.
     * @returns The performance info object
     */
    getPerformanceInfo() {
      return {
        fps: this.fps,
        tps: this.tps,
        idealTps: this.idealTps,
        minFrameTime: this.minFrameTime,
        accumulatedTime: this.accumulatedTime,
      };
    }

    /**
     * Gets the current frames per second.
     * @returns The current FPS value
     */
    getFps(): number {
      return this.fps;
    }

    /**
     * Gets the current ticks per second.
     * @returns The current TPS value
     */
    getTps(): number {
      return this.tps;
    }

    /**
     * Sets whether to log the performance info.
     * @param _val - Whether to log the performance info
     */
    setLoggingPerformanceInfo(_val: boolean): void {
      this.logPerformanceInfo = _val;
    }

    /**
     * Gets whether the engine is logging performance info.
     * @returns Whether the engine is logging performance info
     */
    isLoggingPerformanceInfo(): boolean {
      return this.logPerformanceInfo;
    }

    /**
     * Gets the ideal ticks per second.
     * @returns The ideal TPS value
     */
    getIdealTps(): number {
      return this.idealTps;
    }

    /**
     * Sets the ideal ticks per second.
     * @param _val - The ideal TPS value
     */
    setIdealTps(_val: number): void {
      this.idealTps = _val;
    }

    /**
     * Sets whether to enable frame skipping.
     * @param _val - Whether to enable frame skipping
     */
    setEnableFrameSkipping(_val: boolean): void {
      this.enableFrameSkipping = _val;
    }

    /**
     * Gets whether frame skipping is enabled.
     * @returns Whether frame skipping is enabled
     */
    getEnableFrameSkipping(): boolean {
      return this.enableFrameSkipping;
    }
  }

  /**
   * Handles the rendering of the game.
   */
  class Render {
    /** The Canvas Element */
    private canvas: HTMLCanvasElement;
    /** The WebGL Context */
    private ctx: WebGL2RenderingContext;
    /** The Shader Program */
    private shaderProgram: WebGLProgram;
    /** The Vertex Array Object */
    private vao: WebGLVertexArrayObject;
    /** The Position Buffer */
    private positionBuffer: WebGLBuffer;
    /** The Color Buffer */
    private colorBuffer: WebGLBuffer;
    /** The Texcoord Buffer */
    private texcoordBuffer: WebGLBuffer;
    /** The Position Attribute Location */
    private aPosition: number;
    /** The Color Attribute Location */
    private aColor: number;
    /** The Texcoord Attribute Location */
    private aTexcoord: number;
    /** The Projection Uniform Location */
    private uProjection: WebGLUniformLocation;
    /** The Model Uniform Location */
    private uModel: WebGLUniformLocation;
    /** The View Uniform Location */
    private uView: WebGLUniformLocation;
    /** The Rotation Uniform Location */
    private uRotation: WebGLUniformLocation;
    /** The Alpha Uniform Location */
    private uAlpha: WebGLUniformLocation;
    /** The Vertex Shader Source */
    private vertexShaderSource: string;
    /** Eclipse Segments */
    private eclipseSegments: number;
    /** The Scale */
    private scale: number;
    /** The Projected Matrix */
    private projectedMatrix: Float32Array;
    /** The Full Screen Ratio */
    private fullScreenRatio: [number, number] | null;
    /** The Draw Function */
    private draw: () => void;

    /**
     * Constructor for the Render class.
     * @param canvas - The HTMLCanvasElement to render on
     * @param draw - The function to draw on the canvas
     * @param scale - The scale of the canvas
     */
    constructor(canvas: HTMLCanvasElement, draw: () => void, scale: number) {
      this.eclipseSegments = 100;
      this.canvas = canvas;
      this.ctx = this.canvas.getContext("webgl2") as WebGL2RenderingContext;
      if (!this.ctx) {
        throw new Error("WebGL2 not supported");
      }
      this.fullScreenRatio = null;
      this.draw = draw;
      this.scale = scale;

      const rect = this.canvas.getBoundingClientRect();

      this.canvas.width = rect.width * this.scale;
      this.canvas.height = rect.height * this.scale;

      this.vertexShaderSource = `#version 300 es
        in vec2 a_position;
        in vec2 a_texcoord;
        in vec4 a_color;

        out vec2 v_texcoord;
        out vec4 v_color;

        uniform mat4 u_projection;
        uniform mat4 u_view;
        uniform mat4 u_model;
        uniform float u_rotation;

        void main() {
          float c = cos(u_rotation);
          float s = sin(u_rotation);
          mat2 rotation = mat2(c, -s, s, c);
          vec2 rotatedPos = rotation * a_position;
          gl_Position = u_projection * u_view * u_model * vec4(rotatedPos, 0.0, 1.0);
          v_texcoord = a_texcoord;
          v_color = a_color;
        }
      `;

      const fsSource = `#version 300 es
        precision mediump float;

        in vec2 v_texcoord;
        in vec4 v_color;
        out vec4 fragColor;

        uniform sampler2D u_texture;
        uniform bool u_useTexture;
        uniform float u_alpha;

        void main() {
          if (u_useTexture) {
            vec4 texColor = texture(u_texture, v_texcoord);
            fragColor = vec4(texColor.rgb, texColor.a * u_alpha);
          } else {
            fragColor = vec4(v_color.rgb, v_color.a * u_alpha);
          }
        }
      `;

      const vertexShader = this.ctx.createShader(this.ctx.VERTEX_SHADER);

      if (vertexShader === null) {
        throw new Error(`Vertex shader is null!`);
      }

      this.ctx.shaderSource(vertexShader, this.vertexShaderSource);
      this.ctx.compileShader(vertexShader);

      if (!this.ctx.getShaderParameter(vertexShader, this.ctx.COMPILE_STATUS)) {
        this.ctx.deleteShader(vertexShader);
        throw new Error(
          `Vertex shader compilation failed! Info: ${this.ctx.getShaderInfoLog(
            vertexShader
          )}`
        );
      }

      const fragmentShader = this.ctx.createShader(this.ctx.FRAGMENT_SHADER);

      if (fragmentShader === null) {
        throw new Error(`Fragment shader is null!`);
      }

      this.ctx.shaderSource(fragmentShader, fsSource);
      this.ctx.compileShader(fragmentShader);

      if (
        !this.ctx.getShaderParameter(fragmentShader, this.ctx.COMPILE_STATUS)
      ) {
        throw new Error(
          `Fragment shader compilation failed! Info: ${this.ctx.getShaderInfoLog(
            fragmentShader
          )}`
        );
      }

      this.shaderProgram = this.ctx.createProgram();

      this.ctx.attachShader(this.shaderProgram, vertexShader);
      this.ctx.attachShader(this.shaderProgram, fragmentShader);
      this.ctx.linkProgram(this.shaderProgram);

      if (
        !this.ctx.getProgramParameter(this.shaderProgram, this.ctx.LINK_STATUS)
      ) {
        throw new Error(
          `Program linking failed! Info: ${this.ctx.getProgramInfoLog(
            this.shaderProgram
          )}`
        );
      }

      this.ctx.useProgram(this.shaderProgram);

      this.aPosition = this.ctx.getAttribLocation(
        this.shaderProgram,
        "a_position"
      );

      this.aColor = this.ctx.getAttribLocation(this.shaderProgram, "a_color");

      this.aTexcoord = this.ctx.getAttribLocation(
        this.shaderProgram,
        "a_texcoord"
      );

      const uProjection = this.ctx.getUniformLocation(
        this.shaderProgram,
        "u_projection"
      );
      if (uProjection === null) {
        throw new Error("Could not get uniform location for u_projection");
      }
      this.uProjection = uProjection;

      const uModel = this.ctx.getUniformLocation(this.shaderProgram, "u_model");
      if (uModel === null) {
        throw new Error("Could not get uniform location for u_model");
      }
      this.uModel = uModel;

      const uView = this.ctx.getUniformLocation(this.shaderProgram, "u_view");
      if (uView === null) {
        throw new Error("Could not get uniform location for u_view");
      }
      this.uView = uView;

      const uRotation = this.ctx.getUniformLocation(
        this.shaderProgram,
        "u_rotation"
      );
      if (uRotation === null) {
        throw new Error("Could not get uniform location for u_rotation");
      }
      this.uRotation = uRotation;

      const uAlpha = this.ctx.getUniformLocation(this.shaderProgram, "u_alpha");
      if (uAlpha === null) {
        throw new Error("Could not get uniform location for u_alpha");
      }
      this.uAlpha = uAlpha;

      this.positionBuffer = this.ctx.createBuffer();
      this.colorBuffer = this.ctx.createBuffer();

      this.vao = this.ctx.createVertexArray();
      this.ctx.bindVertexArray(this.vao);

      this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.positionBuffer);
      this.ctx.enableVertexAttribArray(this.aPosition as number);
      this.ctx.vertexAttribPointer(
        this.aPosition as number,
        2,
        this.ctx.FLOAT,
        false,
        0,
        0
      );

      this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.colorBuffer);
      this.ctx.enableVertexAttribArray(this.aColor as number);
      this.ctx.vertexAttribPointer(
        this.aColor as number,
        4,
        this.ctx.FLOAT,
        false,
        0,
        0
      );

      this.texcoordBuffer = this.ctx.createBuffer();
      this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.texcoordBuffer);
      this.ctx.enableVertexAttribArray(this.aTexcoord);
      this.ctx.vertexAttribPointer(
        this.aTexcoord,
        2,
        this.ctx.FLOAT,
        false,
        0,
        0
      );

      this.ctx.bindVertexArray(null);

      this.ctx.viewport(0, 0, this.canvas.width, this.canvas.height);

      this.projectedMatrix = this.orthographic(
        0,
        this.canvas.width,
        this.canvas.height,
        0
      );

      this.ctx.enable(this.ctx.BLEND);
      this.ctx.blendFunc(this.ctx.SRC_ALPHA, this.ctx.ONE_MINUS_SRC_ALPHA);
    }

    /**
     * Returns a function that draws the game on the canvas.
     * @returns The draw function
     */
    drawFunction() {
      return (() => {
        this.ctx.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.clearColor(0.0, 0.0, 0.0, 1.0);
        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);

        const image = getGame().getBackgroundImage();

        if (image !== null) {
          this.drawImage(0, 0, this.getWidth(), this.getHeight(), image);
        }

        getGame()
          .getParticles()
          .forEach((particle) => {
            if (particle.isOnScreen()) {
              this.drawParticle(particle);
              particle.draw();
            }
          });

        getGame()
          .getSprites()
          .forEach((sprite) => {
            if (sprite.isOnScreen()) {
              this.drawSprite(sprite);
              sprite.draw();
            }
          });

        this.draw();
      }).bind(this);
    }

    /**
     * Draws a sprite on the canvas.
     * @param object - The sprite to draw
     */
    private drawSprite(object: Sprite): void {
      if (object.getEffect().getHidden()) {
        return;
      }

      const alpha = 1 - object.getEffect().getTransparency() / 100;
      const color = this.hexToRgb(object.getColor());
      const rotation = (object.getEffect().getRotation() * Math.PI) / 180;

      if (object.getCostumes().getCostume() !== null) {
        const image = object.getCostumes().getCostume() as HTMLImageElement;
        this.drawImage(
          object.getX() - getCamera().getX(),
          object.getY() - getCamera().getY(),
          object.getWidth(),
          object.getHeight(),
          image,
          alpha,
          rotation
        );
        return;
      }

      if (object.getEffect().getIsEclipse()) {
        this.drawEclipse(
          object.getX() - getCamera().getX(),
          object.getY() - getCamera().getY(),
          object.getWidth(),
          object.getHeight(),
          [color[0], color[1], color[2]],
          alpha,
          rotation
        );
        return;
      }

      this.drawRect(
        object.getX() - getCamera().getX(),
        object.getY() - getCamera().getY(),
        object.getWidth(),
        object.getHeight(),
        [color[0], color[1], color[2]],
        alpha,
        rotation
      );
    }

    /**
     * Draws a particle on the canvas.
     * @param particle - The particle to draw
     */
    private drawParticle(particle: Particle): void {
      if (particle.getEffects().getHidden()) {
        return;
      }

      const alpha = 1 - particle.getEffects().getTransparency() / 100;
      const color = this.hexToRgb(particle.getColor());
      const rotation = (particle.getEffects().getRotation() * Math.PI) / 180;

      if (particle.getEffects().getIsEclipse()) {
        this.drawEclipse(
          particle.getX() - getCamera().getX(),
          particle.getY() - getCamera().getY(),
          particle.getWidth(),
          particle.getHeight(),
          [color[0], color[1], color[2]],
          alpha,
          rotation
        );
        return;
      }

      this.drawRect(
        particle.getX() - getCamera().getX(),
        particle.getY() - getCamera().getY(),
        particle.getWidth(),
        particle.getHeight(),
        [color[0], color[1], color[2]],
        alpha,
        rotation
      );
    }

    /**
     * Converts hex color string to RGB array.
     * @param hex - The hex color
     * @returns The RGB color
     */
    private hexToRgb(hex: string): number[] {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255,
          ]
        : [0, 0, 0];
    }

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
    private drawRect(
      x: number,
      y: number,
      width: number,
      height: number,
      color: [number, number, number],
      alpha: number = 1,
      rotation: number = 0
    ): void {
      const uUseTexture = this.ctx.getUniformLocation(
        this.shaderProgram,
        "u_useTexture"
      );
      this.ctx.uniform1i(uUseTexture, 0);

      const positions = [
        -width / 2,
        -height / 2,
        width / 2,
        -height / 2,
        -width / 2,
        height / 2,
        width / 2,
        height / 2,
      ];

      const colors = [
        color[0],
        color[1],
        color[2],
        1,
        color[0],
        color[1],
        color[2],
        1,
        color[0],
        color[1],
        color[2],
        1,
        color[0],
        color[1],
        color[2],
        1,
      ];

      const translationMatrix = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x + width / 2, y + height / 2, 0, 1
      ]);

      this.ctx.uniform1f(this.uAlpha, alpha);

      this.ctx.uniformMatrix4fv(this.uProjection, false, this.projectedMatrix);
      this.ctx.uniformMatrix4fv(this.uView, false, translationMatrix);
      this.ctx.uniformMatrix4fv(
        this.uModel,
        false,
        new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
      );

      this.ctx.uniform1f(this.uRotation, rotation);

      this.ctx.useProgram(this.shaderProgram);
      this.ctx.bindVertexArray(this.vao);

      this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.positionBuffer);
      this.ctx.bufferData(
        this.ctx.ARRAY_BUFFER,
        new Float32Array(positions),
        this.ctx.STATIC_DRAW
      );

      this.ctx.vertexAttribPointer(
        this.aPosition as number,
        2,
        this.ctx.FLOAT,
        false,
        0,
        0
      );

      this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.colorBuffer);
      this.ctx.bufferData(
        this.ctx.ARRAY_BUFFER,
        new Float32Array(colors),
        this.ctx.STATIC_DRAW
      );

      this.ctx.vertexAttribPointer(
        this.aColor as number,
        4,
        this.ctx.FLOAT,
        false,
        0,
        0
      );

      this.ctx.drawArrays(this.ctx.TRIANGLE_STRIP, 0, 4);

      this.ctx.bindVertexArray(null);
    }

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
    private drawImage(
      x: number,
      y: number,
      width: number,
      height: number,
      image: WebGLTexture,
      alpha: number = 1,
      rotation: number = 0
    ) {
      const uUseTexture = this.ctx.getUniformLocation(
        this.shaderProgram,
        "u_useTexture"
      );
      this.ctx.uniform1i(uUseTexture, 1);

      const positions = new Float32Array([
        -width / 2,
        -height / 2,
        width / 2,
        -height / 2,
        -width / 2,
        height / 2,
        width / 2,
        height / 2,
      ]);

      const texcoords = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0,
      ]);

      const translationMatrix = new Float32Array([
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        x + width / 2,
        y + height / 2,
        0,
        1,
      ]);

      const modelMatrix = new Float32Array([
        1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
      ]);

      this.ctx.useProgram(this.shaderProgram);

      this.ctx.uniform1f(this.uAlpha, alpha);
      this.ctx.uniformMatrix4fv(this.uProjection, false, this.projectedMatrix);
      this.ctx.uniformMatrix4fv(this.uView, false, translationMatrix);
      this.ctx.uniformMatrix4fv(this.uModel, false, modelMatrix);
      this.ctx.uniform1f(this.uRotation, rotation);
      this.ctx.uniform1i(
        this.ctx.getUniformLocation(this.shaderProgram, "u_useTexture"),
        1
      );

      this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.positionBuffer);
      this.ctx.bufferData(
        this.ctx.ARRAY_BUFFER,
        positions,
        this.ctx.DYNAMIC_DRAW
      );
      this.ctx.enableVertexAttribArray(this.aPosition);
      this.ctx.vertexAttribPointer(
        this.aPosition,
        2,
        this.ctx.FLOAT,
        false,
        0,
        0
      );

      this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.texcoordBuffer);
      this.ctx.bufferData(
        this.ctx.ARRAY_BUFFER,
        texcoords,
        this.ctx.DYNAMIC_DRAW
      );
      this.ctx.enableVertexAttribArray(this.aTexcoord);
      this.ctx.vertexAttribPointer(
        this.aTexcoord,
        2,
        this.ctx.FLOAT,
        false,
        0,
        0
      );

      this.ctx.disableVertexAttribArray(this.aColor);

      this.ctx.activeTexture(this.ctx.TEXTURE0);
      this.ctx.bindTexture(this.ctx.TEXTURE_2D, image);
      const uTexture = this.ctx.getUniformLocation(
        this.shaderProgram,
        "u_texture"
      );
      this.ctx.uniform1i(uTexture, 0);

      this.ctx.drawArrays(this.ctx.TRIANGLE_STRIP, 0, 4);

      this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, null);
    }

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
    private drawEclipse(
      x: number,
      y: number,
      width: number,
      height: number,
      color: [number, number, number],
      alpha: number = 1,
      rotation: number = 0
    ) {
      const uUseTexture = this.ctx.getUniformLocation(
        this.shaderProgram,
        "u_useTexture"
      );
      this.ctx.uniform1i(uUseTexture, 0);

      const positions = this.createEclipseVertices(
        width / 2,
        height / 2,
        this.eclipseSegments
      );
      const numVertices = positions.length / 2;

      const colors = new Float32Array(numVertices * 4);
      for (let i = 0; i < numVertices; i++) {
        const offset = i * 4;
        colors[offset] = color[0];
        colors[offset + 1] = color[1];
        colors[offset + 2] = color[2];
        colors[offset + 3] = 1.0;
      }

      const translationMatrix = new Float32Array([
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        x + width / 2,
        y + height / 2,
        0,
        1,
      ]);

      this.ctx.useProgram(this.shaderProgram);

      this.ctx.uniform1f(this.uAlpha, alpha);
      this.ctx.uniformMatrix4fv(this.uProjection, false, this.projectedMatrix);
      this.ctx.uniformMatrix4fv(this.uView, false, translationMatrix);
      this.ctx.uniformMatrix4fv(
        this.uModel,
        false,
        new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
      );
      this.ctx.uniform1f(this.uRotation, rotation);
      this.ctx.uniform1i(
        this.ctx.getUniformLocation(this.shaderProgram, "u_useTexture"),
        0
      );

      this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.positionBuffer);
      this.ctx.bufferData(
        this.ctx.ARRAY_BUFFER,
        new Float32Array(positions),
        this.ctx.DYNAMIC_DRAW
      );
      this.ctx.enableVertexAttribArray(this.aPosition);
      this.ctx.vertexAttribPointer(
        this.aPosition,
        2,
        this.ctx.FLOAT,
        false,
        0,
        0
      );

      this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.colorBuffer);
      this.ctx.bufferData(this.ctx.ARRAY_BUFFER, colors, this.ctx.DYNAMIC_DRAW);
      this.ctx.enableVertexAttribArray(this.aColor);
      this.ctx.vertexAttribPointer(this.aColor, 4, this.ctx.FLOAT, false, 0, 0);

      this.ctx.disableVertexAttribArray(this.aTexcoord);

      this.ctx.drawArrays(this.ctx.TRIANGLE_FAN, 0, numVertices);

      this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, null);
    }

    /**
     * Creates the eclipse vertices.
     * @param cx - The x position
     * @param cy - The y position
     * @param rx - The x radius
     * @param ry - The y radius
     * @param segments - The segments
     * @returns The vertices
     */
    private createEclipseVertices(
      rx: number,
      ry: number,
      segments: number = 100
  ): number[] {
      const vertices = [0, 0];
  
      for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * 2 * Math.PI;
          const x = rx * Math.cos(theta);
          const y = ry * Math.sin(theta);
          vertices.push(x, y);
      }
  
      return vertices;
  }

    /**
     * Orthographic projection.
     * @param left - The left
     * @param right - The right
     * @param bottom - The bottom
     * @param top - The top
     * @returns The orthographic projection
     */
    private orthographic(
      left: number,
      right: number,
      bottom: number,
      top: number
    ): Float32Array {
      return new Float32Array([
        2 / (right - left),
        0,
        0,
        0,
        0,
        2 / (top - bottom),
        0,
        0,
        0,
        0,
        -1,
        0,
        -(right + left) / (right - left),
        -(top + bottom) / (top - bottom),
        0,
        1,
      ]);
    }

    /**
     * Ajusts the canvas to the window size without a set ratio.
     */
    ajustCanvas() {
      this.canvas.style.width = `${window.innerWidth}px`;
      this.canvas.style.height = `${window.innerHeight}px`;

      this.canvas.width = window.innerWidth * this.scale;
      this.canvas.height = window.innerHeight * this.scale;

      this.canvas.style.position = "absolute";
      this.canvas.style.left = "0";
      this.canvas.style.top = "0";

      this.ctx.viewport(0, 0, this.canvas.width, this.canvas.height);

      this.projectedMatrix = this.orthographic(
        0,
        this.canvas.width,
        this.canvas.height,
        0
      );
    }

    /**
     * Ajusts the canvas to the window size with a set ratio.
     * @param xRatio - The x ratio
     * @param yRatio - The y ratio
     */
    ajustCanvasRatio(xRatio: number, yRatio: number) {
      this.fullScreenRatio = [xRatio, yRatio];
      if (window.innerHeight > window.innerWidth * (yRatio / xRatio)) {
        this.canvas.style.width = `${window.innerWidth}px`;
        this.canvas.style.height = `${window.innerWidth * (yRatio / xRatio)}px`;
      } else {
        this.canvas.style.width = `${window.innerHeight * (xRatio / yRatio)}px`;
        this.canvas.style.height = `${window.innerHeight}px`;
      }

      this.ctx.viewport(0, 0, this.canvas.width, this.canvas.height);

      this.projectedMatrix = this.orthographic(
        0,
        this.canvas.width,
        this.canvas.height,
        0
      );
    }

    /**
     * Gets the canvas.
     * @returns The canvas
     */
    getCanvas() {
      return this.canvas;
    }

    /**
     * Gets the width of the canvas.
     * @returns The width of the canvas
     */
    getWidth() {
      return this.canvas.width;
    }

    /**
     * Gets the height of the canvas.
     * @returns The height of the canvas
     */
    getHeight() {
      return this.canvas.height;
    }

    /**
     * Gets the context of the canvas.
     * @returns The context of the canvas
     */
    getCtx() {
      return this.ctx;
    }

    /**
     * Gets the scale of the canvas.
     * @returns The scale of the canvas
     */
    getScale(): number {
      return this.scale;
    }

    /**
     * Gets the eclipse segments.
     * @returns The eclipse segments
     */
    getEclipseSegments(): number {
      return this.eclipseSegments;
    }

    /**
     * Sets the eclipse segments.
     * @param segments - The segments
     */
    setEclipseSegments(segments: number) {
      this.eclipseSegments = segments;
    }

    /**
     * Gets the full screen ratios.
     * @returns The full screen ratios
     */
    getAdjustedCanvasRatios(): [number, number] | null {
      return this.fullScreenRatio;
    }
  }

  /** Handles the loading of game assets. */
  class Loader {
    /** Image assets */
    private images: {
      [id: string]: WebGLTexture;
    };
    /** Audio assets */
    private audio: { [id: string]: HTMLAudioElement };
    /** The number of assets to load */
    private assetsToLoad: number;

    /**
     * Constructor for the Loader class.
     */
    constructor() {
      this.images = {};
      this.audio = {};
      this.assetsToLoad = 0;
    }

    /**
     * Loads an image.
     * @param id - The id of the image
     * @param src - The source of the image
     */
    loadImage(id: string, src: string) {
      this.assetsToLoad++;
      let image = new Image();
      image.src = src;
      this.images[id] = image;
      image.onload = () => {
        this.assetsToLoad--;

        const ctx = Neutron.getRender().getCtx();
        const texture = ctx.createTexture();
        ctx.bindTexture(ctx.TEXTURE_2D, texture);

        ctx.texImage2D(
          ctx.TEXTURE_2D,
          0,
          ctx.RGBA,
          ctx.RGBA,
          ctx.UNSIGNED_BYTE,
          image
        );

        ctx.generateMipmap(ctx.TEXTURE_2D);

        this.images[id] = texture;
      };
    }

    /**
     * Loads an audio.
     * @param id - The id of the audio
     * @param src - The source of the audio
     */
    loadAudio(id: string, src: string) {
      this.assetsToLoad++;
      let audio = new Audio(src);
      this.audio[id] = audio;
      audio.onload = () => this.assetsToLoad--;
    }

    /**
     * Gets the loaded image by id.
     * @param id - The id of the image
     * @returns The loaded image
     */
    getLoadedImageById = (id: string) => this.images[id];

    /**
     * Gets the loaded audio by id.
     * @param id - The id of the audio
     * @returns The loaded audio
     */
    getLoadedAudioById = (id: string) => this.audio[id];

    /**
     * Gets the number of assets to load.
     * @returns The number of assets to load
     */
    getNumberOfAssetsToLoad() {
      return this.assetsToLoad;
    }
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
    private keysDown: { [key: string]: boolean };
    /** Unajusted mouse X coordinate */
    private mouseClientX: number | null;
    /** Unajusted mouse Y coordinate */
    private mouseClientY: number | null;
    /** Unajusted touch X coordinate */
    private touchClientX: number | null;
    /** Unajusted touch Y coordinate */
    private touchClientY: number | null;
    /** Mouse X coordinate */
    private mouseX: number | null;
    /** Mouse Y coordinate */
    private mouseY: number | null;
    /** Touch X coordinate */
    private touchX: number | null;
    /** Touch Y coordinate */
    private touchY: number | null;
    /** Event object */
    private eventObj: Events;

    /**
     * Constructor for the Controller class.
     * @param render - The render object
     * @param events - The events object
     */
    constructor(render: Render, engine: Engine, events: Events) {
      this.keysDown = {};
      this.mouseClientX = null;
      this.mouseClientY = null;
      this.touchClientX = null;
      this.touchClientY = null;
      this.mouseX = null;
      this.mouseY = null;
      this.touchX = null;
      this.touchY = null;
      this.eventObj = events;

      document.onkeydown = (e: KeyboardEvent) => {
        e.preventDefault();
        this.keysDown[e.key] = true;

        switch (e.key) {
          case `F2`:
            engine.setLoggingPerformanceInfo(
              !engine.isLoggingPerformanceInfo()
            );
            break;
        }

        this.eventObj.onKeyDown(e);
      };

      document.onkeyup = (e: KeyboardEvent) => {
        e.preventDefault();
        this.keysDown[e.key] = false;
        this.eventObj.onKeyUp(e);
      };

      render.getCanvas().addEventListener(`mousedown`, (e) => {
        e.preventDefault();
        const camera = getCamera();

        const x =
          (e.clientX - Neutron.getRender().getCanvas().offsetLeft) *
            (Neutron.getRender().getWidth() /
              Neutron.getRender().getCanvas().getBoundingClientRect().width) +
          camera.getX();

        const y =
          (e.clientY - Neutron.getRender().getCanvas().offsetTop) *
            (Neutron.getRender().getHeight() /
              Neutron.getRender().getCanvas().getBoundingClientRect().height) +
          camera.getY();

        this.mouseClientX = e.clientX;
        this.mouseClientY = e.clientY;

        this.mouseX = x;
        this.mouseY = y;

        this.eventObj.isMouseDown = true;
        this.eventObj.mouseEvent = e;
        this.eventObj.mouseDown(e);
      });

      render.getCanvas().addEventListener(`mouseup`, (e) => {
        e.preventDefault();
        const camera = getCamera();

        const x =
          (e.clientX - Neutron.getRender().getCanvas().offsetLeft) *
            (Neutron.getRender().getWidth() /
              Neutron.getRender().getCanvas().getBoundingClientRect().width) +
          camera.getX();

        const y =
          (e.clientY - Neutron.getRender().getCanvas().offsetTop) *
            (Neutron.getRender().getHeight() /
              Neutron.getRender().getCanvas().getBoundingClientRect().height) +
          camera.getY();

        this.mouseClientX = e.clientX;
        this.mouseClientY = e.clientY;

        this.mouseX = x;
        this.mouseY = y;

        this.eventObj.isMouseDown = false;
        this.eventObj.mouseEvent = e;
        this.eventObj.mouseUp(e);
      });

      render.getCanvas().addEventListener(`mousemove`, (e) => {
        e.preventDefault();
        const camera = getCamera();

        const x =
          (e.clientX - Neutron.getRender().getCanvas().offsetLeft) *
            (Neutron.getRender().getWidth() /
              Neutron.getRender().getCanvas().getBoundingClientRect().width) +
          camera.getX();

        const y =
          (e.clientY - Neutron.getRender().getCanvas().offsetTop) *
            (Neutron.getRender().getHeight() /
              Neutron.getRender().getCanvas().getBoundingClientRect().height) +
          camera.getY();

        this.mouseClientX = e.clientX;
        this.mouseClientY = e.clientY;

        this.mouseX = x;
        this.mouseY = y;

        this.eventObj.mouseMove(e);
        this.eventObj.mouseEvent = e;
      });

      render.getCanvas().addEventListener("touchstart", (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const camera = getCamera();

        const x =
          (touch.clientX - Neutron.getRender().getCanvas().offsetLeft) *
            (Neutron.getRender().getWidth() /
              Neutron.getRender().getCanvas().getBoundingClientRect().width) +
          camera.getX();

        const y =
          (touch.clientY - Neutron.getRender().getCanvas().offsetTop) *
            (Neutron.getRender().getHeight() /
              Neutron.getRender().getCanvas().getBoundingClientRect().height) +
          camera.getY();

        this.touchClientX = touch.clientX;
        this.touchClientY = touch.clientY;

        this.touchX = x;
        this.touchY = y;

        this.eventObj.touchStart(e);
        this.eventObj.touchEvent = e;
      });

      render.getCanvas().addEventListener("touchend", (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const camera = getCamera();

        const x =
          (touch.clientX - getRender().getCanvas().offsetLeft) *
            (getRender().getWidth() /
              getRender().getCanvas().getBoundingClientRect().width) +
          camera.getX();
        const y =
          (touch.clientY - getRender().getCanvas().offsetTop) *
            (getRender().getHeight() /
              getRender().getCanvas().getBoundingClientRect().height) +
          camera.getY();

        this.touchClientX = touch.clientX;
        this.touchClientY = touch.clientY;

        this.touchX = x;
        this.touchY = y;

        this.eventObj.touchEnd(e);
        this.eventObj.touchEvent = e;
      });

      render.getCanvas().addEventListener("touchmove", (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const camera = getCamera();

        const x =
          (touch.clientX - getRender().getCanvas().offsetLeft) *
            (getRender().getWidth() /
              getRender().getCanvas().getBoundingClientRect().width) +
          camera.getX();
        const y =
          (touch.clientY - getRender().getCanvas().offsetTop) *
            (getRender().getHeight() /
              getRender().getCanvas().getBoundingClientRect().height) +
          camera.getY();

        this.touchClientX = touch.clientX;
        this.touchClientY = touch.clientY;

        this.touchX = x;
        this.touchY = y;

        this.eventObj.touchMove(e);
        this.eventObj.touchEvent = e;
      });

      document.addEventListener(`visibilitychange`, () => {
        if (document.visibilityState !== `visible`) {
          for (let key in this.keysDown) {
            this.keysDown[key] = false;
          }
          this.eventObj.isMouseDown = false;
          this.eventObj.isTouchDown = false;
        }
      });
    }

    /**
     * Gets the key state.
     * @param key - The key to get the state of
     * @returns The key state
     */
    getKey(key: string) {
      return this.keysDown[key] === undefined ? false : this.keysDown[key];
    }

    /**
     * Gets the mouse X coordinate.
     * @returns The mouse X coordinate
     */
    getMouseX() {
      if (!this.mouseClientX) {
        return null;
      }

      this.mouseX =
        ((this.mouseClientX || 0) - getRender().getCanvas().offsetLeft) *
          (getRender().getWidth() /
            getRender().getCanvas().getBoundingClientRect().width) +
        getCamera().getX();

      return this.mouseX;
    }

    /**
     * Gets the mouse Y coordinate.
     * @returns The mouse Y coordinate
     */
    getMouseY() {
      if (!this.mouseClientY) {
        return null;
      }

      this.mouseY =
        ((this.mouseClientY || 0) - getRender().getCanvas().offsetTop) *
          (getRender().getHeight() /
            getRender().getCanvas().getBoundingClientRect().height) +
        getCamera().getY();

      return this.mouseY;
    }

    /**
     * Gets the touch X coordinate.
     * @returns The touch X coordinate
     */
    getTouchX() {
      if (!this.touchClientX) {
        return null;
      }

      this.touchX =
        ((this.touchClientX || 0) - getRender().getCanvas().offsetLeft) *
          (getRender().getWidth() /
            getRender().getCanvas().getBoundingClientRect().width) +
        getCamera().getX();

      return this.touchX;
    }

    /**
     * Gets the touch Y coordinate.
     * @returns The touch Y coordinate
     */
    getTouchY() {
      if (!this.touchClientY) {
        return null;
      }

      this.touchY =
        ((this.touchClientY || 0) - getRender().getCanvas().offsetTop) *
          (getRender().getHeight() /
            getRender().getCanvas().getBoundingClientRect().height) +
        getCamera().getY();

      return this.touchY;
    }

    /**
     * Gets the mouse down state.
     * @returns The mouse down state
     */
    getIsMouseDown() {
      return this.eventObj.isMouseDown;
    }

    /**
     * Gets the touch down state.
     * @returns The touch down state
     */
    getIsTouchDown() {
      return this.eventObj.isTouchDown;
    }
  }

  /** Handles the game state. */
  class Game {
    /** Array of all sprites in the game */
    private sprites: Sprite[];
    /** Array of all particles in the game */
    private particles: Particle[];
    /** The background image of the game */
    private background: HTMLImageElement | null;
    /** The map reader image of the game */
    private mapReaderImage: HTMLImageElement;
    /** The map reader canvas of the game */
    private mapReaderCanvas: HTMLCanvasElement;

    /**
     * Creates a new game instance.
     * Initializes an empty array of sprites, particles, background, and map reader image and canvas.
     */
    constructor() {
      this.sprites = [];
      this.particles = [];
      this.background = null;
      this.mapReaderImage = document.createElement(`img`);
      this.mapReaderCanvas = document.createElement(`canvas`);
    }

    /**
     * Sorts the sprites by stage level.
     * @param arr - The array of sprites to sort
     * @returns The sorted array of sprites
     */
    private sortSprites(arr: Sprite[]) {
      arr.sort((a, b) => a.getStageLevel() - b.getStageLevel());
      return arr;
    }

    /**
     * Creates a map from an image.
     * @param func - The function to call for each pixel
     */
    private createMapFromImage(
      func: (data: Uint8ClampedArray, x: number, y: number) => void
    ) {
      for (let h = 0; h < this.mapReaderCanvas.height; h++) {
        for (let w = 0; w < this.mapReaderCanvas.width; w++) {
          const ctx = this.mapReaderCanvas.getContext(`2d`);

          if (ctx === null) throw new Error(`Image map canvas ctx null!`);

          const data = ctx.getImageData(w, h, 1, 1).data;

          func(data, w, h);
        }
      }
    }

    /**
     * Uses an image to create a map.
     * @param image - The image to create the map from
     * @param func - The function to call for each pixel
     */
    useImageToCreateMap(
      image: HTMLImageElement,
      func: (data: Uint8ClampedArray, x: number, y: number) => void
    ) {
      this.mapReaderImage = image;

      this.mapReaderCanvas.width = this.mapReaderImage.width;
      this.mapReaderCanvas.height = this.mapReaderImage.height;

      const ctx = this.mapReaderCanvas.getContext(`2d`);

      if (ctx === null) throw new Error(`Image map canvas ctx null!`);

      ctx.drawImage(
        this.mapReaderImage,
        0,
        0,
        this.mapReaderImage.width,
        this.mapReaderImage.height
      );

      this.createMapFromImage(func);

      getEngine().start();
    }

    /**
     * Gets the image data at a location.
     * @param x - The x coordinate
     * @param y - The y coordinate
     * @returns The image data
     */
    getMapImageDataAtLocation(x: number, y: number) {
      const ctx = this.mapReaderCanvas.getContext(`2d`);

      if (ctx === null) {
        throw new Error(`Image map context is null!`);
      }

      return ctx.getImageData(x, y, 1, 1);
    }

    /**
     * Adds a new sprite to the game.
     * @param sprites - The sprite to add
     */
    addNewSprite(sprites: Sprite | Sprite[]) {
      if (Array.isArray(sprites)) {
        sprites.forEach((sprite) => {
          if (!this.sprites.includes(sprite)) {
            this.sprites.push(sprite);
          }
        });
      } else {
        const sprite = sprites as Sprite;
        if (!this.sprites.includes(sprite)) {
          this.sprites.push(sprite);
        }
      }

      this.sprites = this.sortSprites(this.sprites);
    }

    /**
     * Adds a new particle to the game.
     * @param particle - The particle to add
     */
    addParticle(particle: Particle | Particle[]) {
      if (Array.isArray(particle)) {
        particle.forEach((p) => {
          if (!this.particles.includes(p)) {
            this.particles.push(p);
          }
        });
      } else {
        const p = particle as Particle;
        if (!this.particles.includes(p)) {
          this.particles.push(p);
        }
      }
    }

    /**
     * Gets a sprite by its id.
     * @param id - The id of the sprite
     * @returns The sprite
     */
    getSpriteById = (id: string) =>
      this.sprites.filter((sprite) => sprite.getId() === id)[0];

    /**
     * Gets a particle by its id.
     * @param id - The id of the particle
     * @returns The particle
     */
    getParticleById = (id: string) =>
      this.particles.filter((particle) => particle.getId() === id)[0];

    /**
     * Gets sprites by type.
     * @param constructor - The constructor of the sprite
     * @returns The sprites
     */
    getSpritesByType<T extends Sprite>(
      constructor: new (...args: any[]) => T
    ): T[] {
      const sprites: Sprite[] = this.sprites;
      return sprites.filter(
        (sprite): sprite is T => sprite instanceof constructor
      );
    }

    /**
     * Gets particles by type.
     * @param constructor - The constructor of the particle
     * @returns The particles
     */
    getParticlesByType<T extends Particle>(
      constructor: new (...args: any[]) => T
    ): T[] {
      const particles: Particle[] = this.particles;
      return particles.filter(
        (particle): particle is T => particle instanceof constructor
      );
    }

    /**
     * Deletes a sprite by its id.
     * @param id - The id of the sprite
     */
    deleteSpriteById = (id: string) =>
      (this.sprites = this.sprites.filter((sprite) => sprite.getId() !== id));

    /**
     * Deletes a particle by its id.
     * @param id - The id of the particle
     */
    deleteParticleById = (id: string) =>
      (this.particles = this.particles.filter(
        (particle) => particle.getId() !== id
      ));

    /**
     * Deletes sprites by type.
     * @param type - The type of the sprite
     */
    deleteSpritesByType = (type: any) =>
      (this.sprites = this.sprites.filter((sprite) => sprite! instanceof type));

    /**
     * Deletes particles by type.
     * @param type - The type of the particle
     */
    deleteParticlesByType = (type: any) =>
      (this.particles = this.particles.filter(
        (particle) => particle! instanceof type
      ));

    /**
     * Deletes all sprites.
     */
    deleteSprites = () => {
      this.sprites.length = 0;
    };

    /**
     * Deletes all particles.
     */
    deleteParticles = () => {
      this.particles.length = 0;
    };

    /**
     * Sets a dynamic background image.
     * @param image - The image to set
     * @param x - The x coordinate
     * @param y - The y coordinate
     * @param width - The width of the image
     * @param height - The height of the image
     */
    setDynamicBackgroundImage(
      image: HTMLImageElement,
      x: number,
      y: number,
      width: number,
      height: number
    ) {
      const background = new Sprite(
        `background`,
        x,
        y,
        width,
        height,
        `#ffffff`,
        0
      );

      background.getCostumes().addCostume(`set`, image);
      background.getCostumes().setCostumeById(`set`);

      this.addNewSprite(background);
    }

    /**
     * Sets a static background image.
     * @param image - The image to set
     */
    setStaticBackgroundImage = (image: HTMLImageElement) => {
      this.background = image;
    };

    /**
     * Gets the background image.
     * @returns The background image
     */
    getBackgroundImage() {
      return this.background;
    }

    /**
     * Gets the sprites.
     * @returns The sprites
     */
    getSprites() {
      return this.sprites;
    }

    /**
     * Gets the particles.
     * @returns The particles
     */
    getParticles() {
      return this.particles;
    }
  }

  /** Handles the camera. */
  class Camera {
    /** The x coordinate */
    private x: number;
    /** The y coordinate */
    private y: number;
    /** The sprite to follow */
    private toFollow: Sprite | null;

    /**
     * Constructor for the Camera class.
     */
    constructor() {
      this.x = 0;
      this.y = 0;
      this.toFollow = null;
    }

    /**
     * Sets the sprite to follow.
     * @param _val - The sprite to follow
     */
    setToFollow(_val: Sprite | null) {
      this.toFollow = _val;
    }

    /**
     * Gets the sprite to follow.
     * @returns The sprite to follow
     */
    getToFollow() {
      return this.toFollow;
    }

    /**
     * Goes to a location.
     * @param _valx - The x coordinate
     * @param _valy - The y coordinate
     */
    goTo(_valx: number, _valy: number) {
      this.setX(_valx);
      this.setY(_valy);
    }

    /**
     * Gets the x coordinate.
     * @returns The x coordinate
     */
    getX() {
      return this.x;
    }

    /**
     * Sets the x coordinate.
     * @param _val - The x coordinate
     */
    setX(_val: number) {
      this.x = Number(_val.toFixed(1));
    }

    /**
     * Gets the y coordinate.
     * @returns The y coordinate
     */
    getY() {
      return this.y;
    }

    /**
     * Sets the y coordinate.
     * @param _val - The y coordinate
     */
    setY(_val: number) {
      this.y = Number(_val.toFixed(1));
    }

    /**
     * Gets the width.
     * @returns The width
     */
    getWidth() {
      return getRender().getWidth();
    }

    /**
     * Gets the height.
     * @returns The height
     */
    getHeight() {
      return getRender().getHeight();
    }
  }

  /**
   * Base class for all game objects in the engine.
   * Provides common functionality for position, size, and basic game object behavior.
   * All game objects (sprites, particles, etc.) inherit from this class.
   */
  class GameObject {
    /** Unique identifier for the game object */
    private id: string;
    /** X coordinate of the game object's position */
    private x: number;
    /** Y coordinate of the game object's position */
    private y: number;
    /** Width of the game object */
    private width: number;
    /** Height of the game object */
    private height: number;
    /** Color of the game object in hexadecimal format */
    private color: string;

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
    constructor(
      id: string,
      x: number,
      y: number,
      width: number,
      height: number,
      color: string
    ) {
      if (getGame().getSpriteById(id)) {
        throw new Error(`Sprite ${id} already exists!`);
      }

      this.id = id;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.color = color;
    }

    /**
     * Updates the game object's state.
     * Called every game tick. Override this method to implement custom update logic.
     */
    update() {}

    /**
     * Draws the game object.
     * Called every frame. Override this method to implement custom drawing logic.
     */
    draw() {}

    /**
     * Checks if the game object is currently visible on screen.
     * Takes into account the camera position and viewport size.
     *
     * @returns true if any part of the game object is visible on screen
     */
    isOnScreen() {
      return (
        this.x + this.width >= getCamera().getX() &&
        this.x <= getCamera().getX() + getRender().getWidth() &&
        this.y + this.height >= getCamera().getY() &&
        this.y <= getCamera().getY() + getRender().getHeight()
      );
    }

    /**
     * Moves the game object to the specified position.
     *
     * @param x - New x coordinate
     * @param y - New y coordinate
     */
    goTo(x: number, y: number) {
      this.x = x;
      this.y = y;
    }

    /**
     * Moves the game object to a predefined screen position.
     *
     * @param place - The screen position to move to
     * @throws Error if an invalid screen place is specified
     */
    to(place: ScreenPlaces) {
      switch (place) {
        case ScreenPlaces.center:
          this.goTo(
            getRender().getWidth() / 2 - this.getWidth() / 2,
            getRender().getHeight() / 2 - this.getHeight() / 2
          );
          break;
        case ScreenPlaces.verticalCenter:
          this.goTo(
            this.getX(),
            getRender().getHeight() / 2 - this.getHeight() / 2
          );
          break;
        case ScreenPlaces.horizontalCenter:
          this.goTo(
            getRender().getWidth() / 2 - this.getWidth() / 2,
            this.getY()
          );
          break;
        case ScreenPlaces.randomPosition:
          this.goTo(
            Math.floor(Math.random() * getRender().getWidth()),
            Math.floor(Math.random() * getRender().getHeight())
          );
          break;
        default:
          throw new Error(`Invalid screen place: ${place}`);
      }
    }

    /**
     * Gets the unique identifier of the game object.
     *
     * @returns The game object's id
     */
    getId() {
      return this.id;
    }

    /**
     * Sets a new unique identifier for the game object.
     *
     * @param id - The new id
     * @throws Error if a game object with the same id already exists
     */
    setId(id: string) {
      if (getGame().getSpriteById(id)) {
        throw new Error(`Sprite ${id} already exists!`);
      }
      this.id = id;
    }

    /**
     * Gets the x coordinate of the game object.
     *
     * @returns The x coordinate
     */
    getX() {
      return this.x;
    }

    /**
     * Sets the x coordinate of the game object.
     *
     * @param x - The new x coordinate
     */
    setX(x: number) {
      this.x = x;
    }

    /**
     * Gets the y coordinate of the game object.
     *
     * @returns The y coordinate
     */
    getY() {
      return this.y;
    }

    /**
     * Sets the y coordinate of the game object.
     *
     * @param y - The new y coordinate
     */
    setY(y: number) {
      this.y = y;
    }

    /**
     * Gets the width of the game object.
     *
     * @returns The width
     */
    getWidth() {
      return this.width;
    }

    /**
     * Sets the width of the game object.
     *
     * @param width - The new width
     */
    setWidth(width: number) {
      this.width = width;
    }

    /**
     * Gets the height of the game object.
     *
     * @returns The height
     */
    getHeight() {
      return this.height;
    }

    /**
     * Sets the height of the game object.
     *
     * @param height - The new height
     */
    setHeight(height: number) {
      this.height = height;
    }

    /**
     * Gets the color of the game object.
     *
     * @returns The color in hexadecimal format
     */
    getColor() {
      return this.color;
    }

    /**
     * Sets the color of the game object.
     *
     * @param color - The new color in hexadecimal format
     */
    setColor(color: string) {
      this.color = color;
    }
  }

  /**
   * A sprite is a game object that can have costumes, effects, and collision detection.
   * Sprites are the main interactive elements in a game.
   */
  export class Sprite extends GameObject {
    /** The layer level of the sprite (determines drawing order) */
    private stageLevel: number;
    /** Manages the sprite's costumes (appearances) */
    private costumes: Costumes;
    /** Manages the sprite's visual effects */
    private effects: Effects;
    /** Handles collision detection for the sprite */
    private collision: Collision;

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
    constructor(
      id: string,
      x: number,
      y: number,
      width: number,
      height: number,
      color: string,
      stageLevel: number
    ) {
      super(id, x, y, width, height, color);
      this.stageLevel = stageLevel;
      this.effects = new Effects();
      this.costumes = new Costumes();
      this.collision = new Collision(this);
    }

    /**
     * Gets the stage level of the sprite.
     *
     * @returns The stage level (0 is bottom, higher numbers are drawn on top)
     */
    getStageLevel() {
      return this.stageLevel;
    }

    /**
     * Sets the stage level of the sprite.
     *
     * @param stageLevel - The new stage level
     */
    setStageLevel(stageLevel: number) {
      this.stageLevel = stageLevel;
    }

    /**
     * Gets the effects manager for this sprite.
     *
     * @returns The Effects object managing this sprite's visual effects
     */
    getEffect() {
      return this.effects;
    }

    /**
     * Gets the costumes manager for this sprite.
     *
     * @returns The Costumes object managing this sprite's appearances
     */
    getCostumes() {
      return this.costumes;
    }

    /**
     * Gets the collision manager for this sprite.
     *
     * @returns The Collision object handling this sprite's collision detection
     */
    getCollision() {
      return this.collision;
    }
  }

  /**
   * Manages visual effects for game objects.
   * Handles properties like visibility, transparency, rotation, and shape effects.
   */
  class Effects {
    /** Whether the game object is hidden (not rendered) */
    private hidden: boolean;
    /** Transparency level (0-100, where 0 is fully visible and 100 is fully transparent) */
    private transparency: number;
    /** Rotation angle in degrees (0-360) */
    private rotation: number;
    /** Whether the game object should be rendered as an ellipse instead of a rectangle */
    private isEclipse: boolean;

    /**
     * Creates a new Effects manager with default values.
     * Default values:
     * - visible (not hidden)
     * - fully opaque (0% transparency)
     * - no rotation (0 degrees)
     * - rectangular shape (not an ellipse)
     */
    constructor() {
      this.hidden = false;
      this.transparency = 0;
      this.rotation = 0;
      this.isEclipse = false;
    }

    /**
     * Resets all effects to their default values.
     * Makes the game object visible, fully opaque, unrotated, and rectangular.
     */
    clearEffects() {
      this.hidden = false;
      this.transparency = 0;
      this.rotation = 0;
      this.isEclipse = false;
    }

    /**
     * Gets whether the game object is hidden.
     *
     * @returns true if the game object is hidden, false if visible
     */
    getHidden() {
      return this.hidden;
    }

    /**
     * Sets whether the game object is hidden.
     *
     * @param hidden - true to hide the game object, false to show it
     */
    setHidden(hidden: boolean) {
      this.hidden = hidden;
    }

    /**
     * Gets the transparency level of the game object.
     *
     * @returns The transparency level (0-100)
     */
    getTransparency() {
      return this.transparency;
    }

    /**
     * Sets the transparency level of the game object.
     *
     * @param transparency - The new transparency level (0-100)
     * @throws Error if transparency is not between 0 and 100
     */
    setTransparency(transparency: number) {
      if (transparency < 0 || transparency > 100) {
        throw new Error(
          `Transparency must be between 0 and 100, got ${transparency}`
        );
      }
      this.transparency = transparency;
    }

    /**
     * Gets the rotation angle of the game object.
     *
     * @returns The rotation angle in degrees (0-360)
     */
    getRotation() {
      return this.rotation;
    }

    /**
     * Sets the rotation angle of the game object.
     *
     * @param rotation - The new rotation angle in degrees
     */
    setRotation(rotation: number) {
      this.rotation = rotation;
    }

    /**
     * Gets whether the game object is rendered as an ellipse.
     *
     * @returns true if the game object is an ellipse, false if it's a rectangle
     */
    getIsEclipse() {
      return this.isEclipse;
    }

    /**
     * Sets whether the game object should be rendered as an ellipse.
     *
     * @param isEclipse - true to render as an ellipse, false to render as a rectangle
     */
    setIsEclipse(isEclipse: boolean) {
      this.isEclipse = isEclipse;
    }
  }

  /**
   * Manages costumes (appearances) for sprites.
   * Handles multiple costumes and switching between them.
   */
  class Costumes {
    /** Map of costume IDs to their corresponding textures */
    private costumes: { [id: string]: WebGLTexture | null };
    /** ID of the currently active costume */
    private id: string;

    /**
     * Creates a new Costumes manager with a default "NONE" costume.
     * The "NONE" costume is a special costume that represents no texture.
     */
    constructor() {
      this.costumes = {
        NONE: null,
      };
      this.id = `NONE`;
    }

    /**
     * Adds a new costume to the sprite.
     *
     * @param id - Unique identifier for the costume
     * @param texture - The WebGL texture for the costume, or null for no texture
     * @throws Error if the costume ID is "NONE" (reserved)
     */
    addCostume(id: string, texture: WebGLTexture | null) {
      if (id.toUpperCase() === `NONE`) {
        throw new Error(`Cannot add Costume as Id 'None'!`);
      }

      this.costumes[id] = texture;
    }

    /**
     * Sets the active costume by its ID.
     *
     * @param id - The ID of the costume to activate
     */
    setCostumeById(id: string) {
      if (id.toUpperCase() === `NONE`) {
        this.id = `NONE`;
      } else {
        this.id = id;
      }
    }

    /**
     * Gets the currently active costume's texture.
     *
     * @returns The WebGL texture of the active costume, or null if no texture
     */
    getCostume() {
      return this.costumes[this.id];
    }

    /**
     * Gets the WebGL texture of the currently active costume.
     *
     * @returns The WebGL texture, or null if no texture is set
     */
    getTexture(): WebGLTexture | null {
      return this.costumes[this.id];
    }
  }

  /** Handles the collision of the sprite. */
  class Collision {
    /** The sprite this collision manager belongs to */
    private me: Sprite;

    /**
     * Creates a new collision manager for a sprite.
     *
     * @param sprite - The sprite this collision manager belongs to
     */
    constructor(me: Sprite) {
      this.me = me;
    }

    /**
     * Gets all sprites touching the self sprite.
     * @returns All sprites touching the self sprite
     */
    touchingSprite = () =>
      getGame()
        .getSprites()
        .filter(
          (sprite: Sprite) => this.touching(sprite) && sprite !== this.me
        );

    /**
     * Checks if the self sprite is touching another sprite.
     * @param other - The other sprite
     * @returns Whether the self sprite is touching the other sprite
     */
    touching(other: Sprite) {
      return (
        this.me.getX() < other.getX() + other.getWidth() &&
        this.me.getX() + this.me.getWidth() > other.getX() &&
        this.me.getY() < other.getY() + other.getHeight() &&
        this.me.getY() + this.me.getHeight() > other.getY()
      );
    }

    /**
     * Gets all sprites above the self sprite.
     * @returns All sprites above the self sprite
     */
    getSpriteAboveSelf() {
      this.me.setY(this.me.getY() - 1);
      const touchingSprites = getGame()
        .getSprites()
        .filter(
          (sprite: Sprite) =>
            this.me.getCollision().touching(sprite) && this.me !== sprite
        );
      this.me.setY(this.me.getY() + 1);
      return touchingSprites;
    }

    /**
     * Gets all sprites below the self sprite.
     * @returns All sprites below the self sprite
     */
    getSpriteBelowSelf() {
      this.me.setY(this.me.getY() + 1);
      const touchingSprites = getGame()
        .getSprites()
        .filter(
          (sprite: Sprite) =>
            this.me.getCollision().touching(sprite) && this.me !== sprite
        );
      this.me.setY(this.me.getY() - 1);
      return touchingSprites;
    }

    /**
     * Gets all sprites to the left of the self sprite.
     * @returns All sprites to the left of the self sprite
     */
    getSpriteLeftSelf() {
      this.me.setX(this.me.getX() - 1);
      const touchingSprites = getGame()
        .getSprites()
        .filter(
          (sprite: Sprite) =>
            this.me.getCollision().touching(sprite) && this.me !== sprite
        );
      this.me.setX(this.me.getX() + 1);
      return touchingSprites;
    }

    /**
     * Gets all sprites to the right of the self sprite.
     * @returns All sprites to the right of the self sprite
     */
    getSpriteRightSelf() {
      this.me.setX(this.me.getX() + 1);
      const touchingSprites = getGame()
        .getSprites()
        .filter(
          (sprite: Sprite) =>
            this.me.getCollision().touching(sprite) && this.me !== sprite
        );
      this.me.setX(this.me.getX() - 1);
      return touchingSprites;
    }
  }

  /** A particle game object that can be extended to create your own particles. */
  export class Particle extends GameObject {
    /** The effects of the particle */
    private effects: Effects;

    /**
     * Constructor for the Particle class.
     * @param id - The id of the particle
     * @param x - The x position of the particle
     * @param y - The y position of the particle
     * @param width - The width of the particle
     * @param height - The height of the particle
     * @param color - The color of the particle in hexadecimal format
     */
    constructor(
      id: string,
      x: number,
      y: number,
      width: number,
      height: number,
      color: string
    ) {
      super(id, x, y, width, height, color);
      this.effects = new Effects();
    }

    /**
     * Gets the effects of the particle.
     * @returns The effects of the particle
     */
    getEffects() {
      return this.effects;
    }
  }

  /** Platformer Sprite; Contains movement and collision features. */
  export class Platformer extends Sprite {
    /** The velocity of the sprite on the x axis. */
    private vx: number;
    /** The speed of the sprite on the x axis. */
    private vxSpeed: number;
    /** The maximum velocity of the sprite on the x axis. */
    private maxVX: number | null;
    /** The velocity of the sprite on the y axis. */
    private vy: number;
    /** The speed of the sprite on the y axis. */
    private vySpeed: number;
    /** The maximum velocity of the sprite on the y axis. */
    private maxVY: number | null;
    /** The gravity acceleration of the sprite. */
    private gravityAcc: number;
    /** Whether the sprite has a platformer below it. */
    private hasPlatformerBelow: boolean;
    /** Whether to check all platformers. */
    private checkAllPlatformers: boolean;
    /** The platformers to check collision with. */
    private platformersToCheckCollision: Platformer[];

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
    constructor(
      id: string,
      x: number,
      y: number,
      width: number,
      height: number,
      color: string,
      stageLevel: number
    ) {
      super(id, x, y, width, height, color, stageLevel);
      this.vx = 0;
      this.vy = 0;
      this.vxSpeed = 0.5;
      this.vySpeed = 0.5;
      this.maxVX = null;
      this.maxVY = null;
      this.gravityAcc = 0.2;
      this.hasPlatformerBelow = false;
      this.checkAllPlatformers = true;
      this.platformersToCheckCollision = getGame().getSpritesByType(Platformer);
    }

    /**
     * Applies gravity to the platformer sprite.
     */
    doGravity() {
      if (this.checkAllPlatformers) {
        this.platformersToCheckCollision =
          getGame().getSpritesByType(Platformer);
      }

      this.hasPlatformerBelow = false;
      this.setY(this.getY() + this.getVY());

      this.platformersToCheckCollision.forEach((platformer) => {
        if (this.getCollision().touching(platformer) && this !== platformer) {
          if (this.vy < 0) {
            this.setY(platformer.getY() + platformer.getHeight());
          } else {
            this.setY(platformer.getY() - this.getHeight());
            this.hasPlatformerBelow = true;
          }

          if (this.getCollision().touching(platformer)) {
            this.setY(this.getY() + 0.1);
          }

          this.setVY(0);
        }
      });

      if (!this.hasPlatformerBelow) {
        this.setVY(this.getVY() + this.getGravityAcc());
      }
    }

    /**
     * Moves the platformer sprite on the x axis.
     * @param x - The amount to move the sprite on the x axis
     */
    moveX(x: number) {
      if (this.checkAllPlatformers) {
        this.platformersToCheckCollision =
          getGame().getSpritesByType(Platformer);
      }

      this.setX(this.getX() + x);

      const touchingPlatformers = this.platformersToCheckCollision.filter(
        (platformer) =>
          this.getCollision().touching(platformer) && this !== platformer
      );

      touchingPlatformers.forEach((platformer) => {
        if (x > 0) this.setX(platformer.getX() - this.getWidth());
        else this.setX(platformer.getX() + platformer.getWidth());
      });
    }

    /**
     * Moves the platformer sprite on the y axis.
     * @param y - The amount to move the sprite on the y axis
     */
    moveY(y: number) {
      if (this.checkAllPlatformers) {
        this.platformersToCheckCollision =
          getGame().getSpritesByType(Platformer);
      }

      this.setY(this.getY() + y);

      const touchingPlatformers = this.platformersToCheckCollision.filter(
        (platformer) =>
          this.getCollision().touching(platformer) && this !== platformer
      );

      touchingPlatformers.forEach((platformer) => {
        if (y > 0) this.setY(platformer.getY() - this.getHeight());
        else this.setY(platformer.getY() + platformer.getHeight());
      });
    }

    /**
     * Makes the platformer sprite jump.
     * @param jumpHeight - The height of the jump
     */
    doJump(jumpHeight: number) {
      if (this.getCollision().getSpriteBelowSelf().length > 0) {
        this.setVY(-jumpHeight);
      }
    }

    /**
     * Gets all platformers above the platformer sprite.
     * @returns All platformers above the platformer sprite
     */
    getPlatformerAboveSelf() {
      return this.getCollision()
        .getSpriteAboveSelf()
        .filter((sprite) => sprite instanceof Platformer);
    }

    /**
     * Gets all platformers below the platformer sprite.
     * @returns All platformers below the platformer sprite
     */
    getPlatformerBelowSelf() {
      return this.getCollision()
        .getSpriteBelowSelf()
        .filter((sprite) => sprite instanceof Platformer);
    }

    /**
     * Gets all platformers to the left of the platformer sprite.
     * @returns All platformers to the left of the platformer sprite
     */
    getPlatformerLeftSelf() {
      return this.getCollision()
        .getSpriteLeftSelf()
        .filter((sprite) => sprite instanceof Platformer);
    }

    /**
     * Gets all platformers to the right of the platformer sprite.
     * @returns All platformers to the right of the platformer sprite
     */
    getPlatformerRightSelf() {
      return this.getCollision()
        .getSpriteRightSelf()
        .filter((sprite) => sprite instanceof Platformer);
    }

    /**
     * Adds friction to the platformer sprite on the x axis.
     * @param friction - The friction to add
     */
    addFrictionX(friction: number) {
      this.setVX(this.getVX() * friction);
      if (Math.abs(this.getVX()) < 0.3) this.setVX(0);
    }

    /**
     * Adds friction to the platformer sprite on the y axis.
     * @param friction - The friction to add
     */
    addFrictionY(friction: number) {
      this.setVY(this.getVY() * friction);
      if (Math.abs(this.getVY()) < 0.3) this.setVY(0);
    }

    /**
     * Gets the velocity of the platformer sprite on the x axis.
     * @returns The velocity of the platformer sprite on the x axis
     */
    getVX() {
      return this.vx;
    }

    /**
     * Sets the velocity of the platformer sprite on the x axis.
     * @param _val - The velocity to set
     */
    setVX(_val: number) {
      this.vx = _val;
      this.vx = Number(this.vx.toFixed(1));
      if (this.maxVX !== null && this.vx > this.maxVX) this.vx = this.maxVX;
      else if (this.maxVX !== null && this.vx < -this.maxVX)
        this.vx = -this.maxVX;
    }

    /**
     * Gets the speed of the platformer sprite on the x axis.
     * @returns The speed of the platformer sprite on the x axis
     */
    getVXSpeed() {
      return this.vxSpeed;
    }

    /**
     * Sets the speed of the platformer sprite on the x axis.
     * @param _val - The speed to set
     */
    setVXSpeed(_val: number) {
      this.vxSpeed = _val;
      this.vxSpeed = Number(this.vxSpeed.toFixed(1));
    }

    /**
     * Gets the maximum velocity of the platformer sprite on the x axis.
     * @returns The maximum velocity of the platformer sprite on the x axis
     */
    getMaxVX() {
      return this.maxVX;
    }

    /**
     * Sets the maximum velocity of the platformer sprite on the x axis.
     * @param _val - The maximum velocity to set
     */
    setMaxVX(_val: number | null) {
      this.maxVX = _val;
    }

    /**
     * Gets the velocity of the platformer sprite on the y axis.
     * @returns The velocity of the platformer sprite on the y axis
     */
    getVY() {
      return this.vy;
    }

    /**
     * Sets the velocity of the platformer sprite on the y axis.
     * @param _val - The velocity to set
     */
    setVY(_val: number) {
      this.vy = _val;
      this.vy = Number(this.vy.toFixed(1));
      if (this.maxVY !== null && this.vy > this.maxVY) this.vy = this.maxVY;
      else if (this.maxVY !== null && this.vy < -this.maxVY)
        this.vy = -this.maxVY;
    }

    /**
     * Gets the speed of the platformer sprite on the y axis.
     * @returns The speed of the platformer sprite on the y axis
     */
    getVYSpeed() {
      return this.vySpeed;
    }

    /**
     * Sets the speed of the platformer sprite on the y axis.
     * @param _val - The speed to set
     */
    setVYSpeed(_val: number) {
      this.vySpeed = _val;
      this.vySpeed = Number(this.vySpeed.toFixed(1));
    }

    /**
     * Gets the maximum velocity of the platformer sprite on the y axis.
     * @returns The maximum velocity of the platformer sprite on the y axis
     */
    getMaxVY() {
      return this.maxVY;
    }

    /**
     * Sets the maximum velocity of the platformer sprite on the y axis.
     * @param _val - The maximum velocity to set
     */
    setMaxVY(_val: number | null) {
      this.maxVY = _val;
    }

    /**
     * Gets the gravity acceleration of the platformer sprite.
     * @returns The gravity acceleration of the platformer sprite
     */
    getGravityAcc() {
      return this.gravityAcc;
    }

    /**
     * Sets the gravity acceleration of the platformer sprite.
     * @param _val - The gravity acceleration to set
     */
    setGravityAcc(_val: number) {
      this.gravityAcc = _val;
    }

    /**
     * Gets the platformers to check collision with.
     * @returns The platformers to check collision with
     */
    getPlatformersToCheckCollision() {
      return this.platformersToCheckCollision;
    }

    /**
     * Sets the platformers to check collision with.
     * @param _val - The platformers to check collision with
     */
    setPlatformerSpritesToCheckCollisionWith(_val: Platformer[]) {
      this.platformersToCheckCollision = _val;
    }
  }

  /** The places on the screen. */
  export enum ScreenPlaces {
    center,
    verticalCenter,
    horizontalCenter,
    randomPosition,
  }

  const engine = new Engine();

  /**
   * Gets the engine instance.
   * @returns The engine instance
   */
  export const getEngine = (): Engine => engine;

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
  export let init: (engineSettings: EngineSettings) => void = (
    engineSettings: EngineSettings
  ) => {
    engine.init(engineSettings);
  };
}

export default Neutron;
