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
 * includes core functionality for rendering, game state management, and event handling.
 */
export namespace Neutron {
  /**
   * Interface defining the settings and components required to initialize the game engine.
   */
  interface EngineSettings {
    /** HTMLCanvasElement of the game */
    canvas: HTMLCanvasElement;
    /** Target ticks per second for the game loop */
    tps: number;
    /** Scale of the game canvas */
    scale: number;
    /** Events object */
    events: Events;

    /** Function called every frame to draw the game */
    draw: () => void;
    /** Function called every tick to update game state */
    update: () => void;
    /** Function called once when the game is initialized */
    init: () => void;
    /** Function called to load game assets */
    load: () => void;
  }

  /**
   * Manages the game loop, rendering, and game state updates; provides functionality for
   * controlling frame rate, performance monitoring, and game state management.
   */
  export class Engine {
    /** Current frames per second */
    private fps: number;
    /** Current ticks per second */
    private tps: number;
    /** Counter for FPS calculation */
    private fpsCounter: number;
    /** Counter for TPS calculation */
    private tpsCounter: number;
    /** Target ticks per second for the game loop */
    private idealTps: number;
    /** Timestamp of the last update */
    private lastUpdateTime: number;
    /** Minimum time between updates in milliseconds */
    private minFrameTime: number;
    /** Accumulated time since last update */
    private accumulatedTime: number;
    /** Maximum number of updates per frame */
    private maxUpdatesPerFrame: number;
    /** Whether to enable frame skipping for slow devices */
    private enableFrameSkipping: boolean;
    /** Number of frames to skip when behind */
    private framesToSkip: number;
    /** Whether to log performance info */
    private logPerformanceInfo: boolean;
    /** Engine running state */
    private stopVal: boolean;
    /** Initialization state */
    private hasInited: boolean;
    /** Asset loading state */
    private hasLoadedAssets: boolean;
    /** Game update function */
    private update: () => void;
    /** Initialization function */
    private initFunc: () => void;

    /**
     * Creates a new instance of the Engine class.
     * Initializes default values for performance monitoring and game loop settings.
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
     * @param engineSettings - Configuration object containing all necessary engine components
     * and settings
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

      getRender().getDrawFunction()();

      window.requestAnimationFrame(this.startLoop);
    };

    /**
     * Starts the performance tracker to monitor frame rate and ticks per second;
     * updates FPS and TPS counters every second.
     * @private
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
     * Resets timing variables to ensure consistent behavior.
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
     * Logs the performance info.
     */
    setLoggingPerformanceInfo(_val: boolean): void {
      this.logPerformanceInfo = _val;
    }

    /**
     * Gets the log performance info.
     * @returns The log performance info
     */
    isLoggingPerformanceInfo(): boolean {
      return this.logPerformanceInfo;
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
  }

  /**
   * Handles the rendering of the game.
   */
  export class Render {
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
    /** The Position Attribute Location */
    private aPosition: number;
    /** The Color Attribute Location */
    private aColor: number;
    /** The Texcoord Attribute Location */
    private aTexcoord: number;
    /** The Texcoord Buffer */
    private texcoordBuffer: WebGLBuffer;
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
    /** The Scale */
    private scale: number;
    /** The Full Screen Ratio */
    private fullScreenRatio: [number, number] | null;
    /** The Draw Function */
    private draw: () => void;
    /** The Vertex Shader Source */
    private vertexShaderSource: string;
    /** Reusable array for visible sprites */
    private visibleSprites: Sprite[] = [];
    /** Reusable array for visible particles */
    private visibleParticles: Particle[] = [];

    /**
     * Constructor for the Render class.
     * @param canvas - The HTMLCanvasElement to render on
     * @param draw - The function to draw on the canvas
     * @param scale - The scale of the canvas
     */
    constructor(canvas: HTMLCanvasElement, draw: () => void, scale: number) {
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

      this.ctx.viewport(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    /**
     * Returns a function that draws the game on the canvas.
     * @returns The draw function
     */
    private drawFunction() {
      return () => {
        this.ctx.clearColor(0.8, 0.8, 0.8, 1);
        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);

        this.drawRect(0, 0, 100, 100, [1, 1, 1, 1], 1);

        this.visibleSprites.length = 0;
        this.visibleParticles.length = 0;

        const image = getGame().getBackgroundImage();
        if (image === null) {
          this.drawRect(0, 0, this.getWidth(), this.getHeight(), [0, 0, 0, 1]);
        } else {
          this.drawImage(image, 0, 0, this.getWidth(), this.getHeight());
        }

        getGame()
          .getParticles()
          .forEach((particle) => {
            if (
              this.isVisible(
                particle,
                getCamera().getX(),
                getCamera().getY(),
                this.getWidth(),
                this.getHeight()
              )
            ) {
              this.visibleParticles.push(particle);
            }
          });

        getGame()
          .getSprites()
          .forEach((sprite) => {
            if (
              this.isVisible(
                sprite,
                getCamera().getX(),
                getCamera().getY(),
                this.getWidth(),
                this.getHeight()
              )
            ) {
              this.visibleSprites.push(sprite);
            }
          });

        this.visibleParticles.forEach((particle) => {
          this.drawParticle(particle);
        });

        this.visibleSprites.forEach((sprite) => {
          this.drawSprite(sprite);
          sprite.draw();
        });

        this.draw();
      };
    }

    /**
     * Checks if an object is visible on screen
     * @param obj - The object to check
     * @param cameraX - Camera X position
     * @param cameraY - Camera Y position
     * @param screenWidth - Screen width
     * @param screenHeight - Screen height
     * @returns Whether the object is visible
     */
    private isVisible(
      obj: {
        getX: () => number;
        getY: () => number;
        getWidth: () => number;
        getHeight: () => number;
      },
      cameraX: number,
      cameraY: number,
      screenWidth: number,
      screenHeight: number
    ): boolean {
      const x = obj.getX() - cameraX;
      const y = obj.getY() - cameraY;
      const width = obj.getWidth();
      const height = obj.getHeight();

      return (
        x + width >= 0 &&
        x <= screenWidth &&
        y + height >= 0 &&
        y <= screenHeight
      );
    }

    /**
     * Draws a sprite without an image on the canvas.
     * @param object - The sprite to draw
     */
    private drawSprite(object: Sprite): void {
      if (!object.getEffect().getHidden()) {
        const alpha = 1 - object.getEffect().getTransparency() / 100;
        const color = this.hexToRgb(object.getColor());
        const rotation = (object.getEffect().getRotation() * Math.PI) / 180;
        const uUseTexture = this.ctx.getUniformLocation(
          this.shaderProgram,
          "u_useTexture"
        );

        if (object.getCostumes().getCostume() !== null) {
          const image = object.getCostumes().getCostume() as HTMLImageElement;
          this.ctx.uniform1i(uUseTexture, 1);
          this.drawImage(
            image,
            object.getX() - getCamera().getX(),
            object.getY() - getCamera().getY(),
            object.getWidth(),
            object.getHeight(),
            alpha,
            rotation
          );
        } else {
          this.ctx.uniform1i(uUseTexture, 0);
          this.drawRect(
            object.getX() - getCamera().getX(),
            object.getY() - getCamera().getY(),
            object.getWidth(),
            object.getHeight(),
            [color[0], color[1], color[2], 1],
            alpha,
            rotation
          );
        }
      }
    }

    /**
     * Draws a particle.
     * @param particle - The particle to draw
     */
    private drawParticle(particle: Particle): void {
      const alpha = 1 - particle.getTransparency() / 100;
      const color = this.hexToRgb(particle.getColor());
      this.drawRect(
        particle.getX() - getCamera().getX(),
        particle.getY() - getCamera().getY(),
        particle.getWidth(),
        particle.getHeight(),
        [color[0], color[1], color[2], alpha],
        0
      );
    }

    /**
     * Converts hex color to RGB.
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
     * Draws a rectangle.
     * @param x - X position
     * @param y - Y position
     * @param width - Width
     * @param height - Height
     * @param color - Color
     */
    private drawRect(
      x: number,
      y: number,
      width: number,
      height: number,
      color: number[],
      alpha: number = 1,
      rotation: number = 0
    ): void {
      this.ctx.enable(this.ctx.BLEND);
      this.ctx.blendFunc(this.ctx.SRC_ALPHA, this.ctx.ONE_MINUS_SRC_ALPHA);

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
        color[3],
        color[0],
        color[1],
        color[2],
        color[3],
        color[0],
        color[1],
        color[2],
        color[3],
        color[0],
        color[1],
        color[2],
        color[3],
      ];

      const projMatrix = this.orthographic(
        0,
        this.canvas.width,
        this.canvas.height,
        0
      );

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

      this.ctx.uniform1f(this.uAlpha, alpha);

      this.ctx.uniformMatrix4fv(this.uProjection, false, projMatrix);
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

    private drawImage(
      image: WebGLTexture,
      x: number,
      y: number,
      width: number,
      height: number,
      alpha: number = 1,
      rotation: number = 0
    ) {
      this.ctx.enable(this.ctx.BLEND);
      this.ctx.blendFunc(this.ctx.SRC_ALPHA, this.ctx.ONE_MINUS_SRC_ALPHA);

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

      const texcoords = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0];

      const projMatrix = this.orthographic(
        0,
        this.canvas.width,
        this.canvas.height,
        0
      );

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
      this.ctx.bindVertexArray(this.vao);

      this.ctx.uniform1f(this.uAlpha, alpha);

      this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, this.positionBuffer);
      this.ctx.bufferData(
        this.ctx.ARRAY_BUFFER,
        new Float32Array(positions),
        this.ctx.STATIC_DRAW
      );
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
        new Float32Array(texcoords),
        this.ctx.STATIC_DRAW
      );
      this.ctx.vertexAttribPointer(
        this.aTexcoord,
        2,
        this.ctx.FLOAT,
        false,
        0,
        0
      );

      this.ctx.uniformMatrix4fv(this.uProjection, false, projMatrix);
      this.ctx.uniformMatrix4fv(this.uView, false, translationMatrix);
      this.ctx.uniformMatrix4fv(this.uModel, false, modelMatrix);
      this.ctx.uniform1f(this.uRotation, rotation);

      this.ctx.activeTexture(this.ctx.TEXTURE0);
      this.ctx.bindTexture(this.ctx.TEXTURE_2D, image);

      const uTexture = this.ctx.getUniformLocation(
        this.shaderProgram,
        "u_texture"
      );
      this.ctx.uniform1i(uTexture, 0);

      this.ctx.drawArrays(this.ctx.TRIANGLE_STRIP, 0, 4);

      this.ctx.bindVertexArray(null);
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
    }

    /**
     * Gets the draw function.
     * @returns The draw function
     */
    getDrawFunction() {
      return this.drawFunction().bind(this);
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
     * Gets the full screen ratios.
     * @returns The full screen ratios
     */
    getFullScreenRatios(): [number, number] | null {
      return this.fullScreenRatio;
    }
  }

  /** Handles the loading of game assets. */
  export class Loader {
    /** All image assets to load */
    private images: {
      [id: string]: WebGLTexture;
    };
    /** All audio assets to load */
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

    /** Handles the click event */
    onClick(e: KeyboardEvent): void;
    /** Handles the off click event */
    offClick(e: KeyboardEvent): void;

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
  export class Controller {
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

        this.eventObj.onClick(e);
      };

      document.onkeyup = (e: KeyboardEvent) => {
        e.preventDefault();
        this.keysDown[e.key] = false;
        this.eventObj.offClick(e);
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
  export class Game {
    /** List of sprites in the game */
    private sprites: Sprite[];
    /** List of particles in the game */
    private particles: Particle[];
    /** The background image of the game */
    private background: HTMLImageElement | null;
    /** The map reader image of the game */
    private mapReaderImage: HTMLImageElement;
    /** The map reader canvas of the game */
    private mapReaderCanvas: HTMLCanvasElement;

    /**
     * Constructor for the Game class.
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
      return getRender().getWidth;
    }

    /**
     * Gets the height.
     * @returns The height
     */
    getHeight() {
      return getRender().getHeight;
    }
  }

  /** Handles the sprite. */
  export class Sprite {
    /** The id */
    private id: string;
    /** The x coordinate */
    private x: number;
    /** The y coordinate */
    private y: number;
    /** The width */
    private width: number;
    /** The height */
    private height: number;
    /** The color */
    private color: string;
    /** The stage level */
    private stageLevel: number;
    /** The costumes */
    private costumes = new Costumes();
    /** The effects */
    private effects = new Effects();
    /** The collision */
    private collision = new Collision(this);

    /**
     * Constructor for the Sprite class.
     * @param id - The id
     * @param x - The x coordinate
     * @param y - The y coordinate
     * @param width - The width
     * @param height - The height
     * @param color - The color
     * @param stageLevel - The stage level
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
      if (getGame().getSpriteById(id)) {
        throw new Error(`Sprite ${id} already exists!`);
      }

      this.id = id;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.color = color;
      this.stageLevel = stageLevel;
    }

    /**
     * Checks if the sprite is on screen.
     * @returns Whether the sprite is on screen
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
     * Goes to a location.
     * @param _valx - The x coordinate
     * @param _valy - The y coordinate
     */
    goTo(_valx: number, _valy: number) {
      this.x = _valx;
      this.y = _valy;
    }

    /**
     * Goes to a location.
     * @param place - The place
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
      }
    }

    /**
     * Updates the sprite.
     */
    update() {}

    /**
     * Draws the sprite.
     */
    draw() {}

    /**
     * Gets the id.
     * @returns The id
     */
    getId() {
      return this.id;
    }

    /**
     * Sets the id.
     * @param _val - The id
     */
    setId(_val: string) {
      if (getGame().getSpriteById(_val)) {
        throw new Error(`Sprite ${_val} already exists!`);
      }

      this.id = _val;
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
      this.x = _val;
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
      this.y = _val;
    }

    /**
     * Gets the width.
     * @returns The width
     */
    getWidth() {
      return this.width;
    }

    /**
     * Sets the width.
     * @param _val - The width
     */
    setWidth(_val: number) {
      this.width = _val;
    }

    /**
     * Gets the height.
     * @returns The height
     */
    getHeight() {
      return this.height;
    }

    /**
     * Sets the height.
     * @param _val - The height
     */
    setHeight(_val: number) {
      this.height = _val;
    }

    /**
     * Gets the color.
     * @returns The color
     */
    getColor() {
      return this.color;
    }

    /**
     * Sets the color.
     * @param _val - The color
     */
    setColor(_val: string) {
      this.color = _val;
    }

    /**
     * Gets the stage level.
     * @returns The stage level
     */
    getStageLevel() {
      return this.stageLevel;
    }

    /**
     * Sets the stage level.
     * @param _val - The stage level
     */
    setStageLevel(_val: number) {
      this.stageLevel = _val;
    }

    /**
     * Gets the effects.
     * @returns The effects
     */
    getEffect() {
      return this.effects;
    }

    /**
     * Gets the collision.
     * @returns The collision
     */
    getCollision() {
      return this.collision;
    }

    /**
     * Gets the costumes.
     * @returns The costumes
     */
    getCostumes() {
      return this.costumes;
    }
  }

  /** Handles the effects of the sprite. */
  class Effects {
    /** Whether the sprite is hidden */
    private hidden: boolean;
    /** The transparency */
    private transparency: number;
    /** The rotation */
    private rotation: number;
    /** Whether the sprite is an eclipse */
    private isEclipse: boolean;
    /** The eclipse rotation */
    private eclipseRotation: number;
    /** The eclipse start angle */
    private eclipseStartAngle: number;
    /** The eclipse end angle */
    private eclipseEndAngle: number;

    /**
     * Constructor for the Effects class.
     */
    constructor() {
      this.hidden = false;
      this.transparency = 0;
      this.rotation = 0;
      this.isEclipse = false;
      this.eclipseRotation = 0;
      this.eclipseStartAngle = 0;
      this.eclipseEndAngle = 2 * Math.PI;
    }

    /**
     * Clears the effects.
     */
    clearEffects() {
      this.hidden = false;
      this.transparency = 0;
      this.rotation = 0;
      this.isEclipse = false;
      this.eclipseRotation = 0;
      this.eclipseStartAngle = 0;
      this.eclipseEndAngle = 2 * Math.PI;
    }

    /**
     * Gets whether the sprite is hidden.
     * @returns Whether the sprite is hidden
     */
    getHidden() {
      return this.hidden;
    }

    /**
     * Sets whether the sprite is hidden.
     * @param _val - Whether the sprite is hidden
     */
    setHidden(_val: boolean) {
      this.hidden = _val;
    }

    /**
     * Gets the transparency.
     * @returns The transparency
     */
    getTransparency() {
      return this.transparency;
    }

    /**
     * Sets the transparency.
     * @param _val - The transparency
     */
    setTransparency(_val: number) {
      this.transparency = _val;
    }

    /**
     * Gets the rotation.
     * @returns The rotation
     */
    getRotation() {
      return this.rotation;
    }

    /**
     * Sets the rotation.
     * @param _val - The rotation
     */
    setRotation(_val: number) {
      this.rotation = _val;
    }

    /**
     * Gets whether the sprite is an eclipse.
     * @returns Whether the sprite is an eclipse
     */
    getIsEclipse() {
      return this.isEclipse;
    }

    /**
     * Sets whether the sprite is an eclipse.
     * @param _val - Whether the sprite is an eclipse
     */
    setIsEclipse(_val: boolean) {
      this.isEclipse = _val;
    }

    /**
     * Gets the eclipse rotation.
     * @returns The eclipse rotation
     */
    getEclipseRotation() {
      return this.eclipseRotation;
    }

    /**
     * Sets the eclipse rotation.
     * @param _val - The eclipse rotation
     */
    setEclipseRotation(_val: number) {
      this.eclipseRotation = _val;
    }

    /**
     * Gets the eclipse start angle.
     * @returns The eclipse start angle
     */
    getEclipseStartAngle() {
      return this.eclipseStartAngle;
    }

    /**
     * Sets the eclipse start angle.
     * @param _val - The eclipse start angle
     */
    setEclipseStartAngle(_val: number) {
      this.eclipseStartAngle = _val;
    }

    /**
     * Gets the eclipse end angle.
     * @returns The eclipse end angle
     */
    getEclipseEndAngle() {
      return this.eclipseEndAngle;
    }

    /**
     * Sets the eclipse end angle.
     * @param _val - The eclipse end angle
     */
    setEclipseEndAngle(_val: number) {
      this.eclipseEndAngle = _val;
    }
  }

  /** Handles the costumes of the sprite. */
  class Costumes {
    /** The costumes */
    private costumes: { [id: string]: WebGLTexture | null };
    /** The current costume */
    private id: string;

    /**
     * Constructor for the Costumes class.
     */
    constructor() {
      this.costumes = {
        NONE: null,
      };
      this.id = `NONE`;
    }

    /**
     * Adds a costume.
     * @param id - The id
     * @param image - The image
     */
    addCostume(id: string, image: WebGLTexture | null) {
      if (id.toUpperCase() === `NONE`) {
        throw new Error(`Cannot add Costume as Id 'None'!`);
      }

      this.costumes[id] = image;
    }

    /**
     * Sets the costume by id.
     * @param id - The id
     */
    setCostumeById(id: string) {
      if (id.toUpperCase() === `NONE`) {
        this.id = `NONE`;
      } else {
        this.id = id;
      }
    }

    /**
     * Gets the costume.
     * @returns The costume
     */
    getCostume() {
      return this.costumes[this.id];
    }
  }

  /** Handles the collision of the sprite. */
  class Collision {
    /** Self sprite */
    private me: Sprite;

    /**
     * Constructor for the Collision class.
     * @param me - Self sprite
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

  export class Particle {
    /** The id of the particle. */
    private id: string;
    /** The x position of the particle. */
    private x: number;
    /** The y position of the particle. */
    private y: number;
    /** The width of the particle. */
    private width: number;
    /** The height of the particle. */
    private height: number;
    /** The color of the particle. */
    private color: string;
    /** The velocity of the particle on the x axis. */
    private vx: number;
    /** The velocity of the particle on the y axis. */
    private vy: number;
    /** The maximum velocity of the particle on the x axis. */
    private maxVX: number | null;
    /** The maximum velocity of the particle on the y axis. */
    private maxVY: number | null;
    /** The transparency of the particle. */
    private transparency: number;
    /** Whether the particle is an eclipse. */
    private isEclipse: boolean;

    /**
     * Constructor for the Particle class.
     * @param id - The id of the particle
     * @param x - The x position of the particle
     * @param y - The y position of the particle
     * @param width - The width of the particle
     * @param height - The height of the particle
     * @param color - The color of the particle
     */
    constructor(
      id: string,
      x: number,
      y: number,
      width: number,
      height: number,
      color: string
    ) {
      if (getGame().getParticleById(id)) {
        throw new Error(`Particle with id ${id} already exists`);
      }
      this.id = id;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.color = color;
      this.vx = 0;
      this.vy = 0;
      this.maxVX = null;
      this.maxVY = null;
      this.transparency = 0;
      this.isEclipse = false;
    }

    /**
     * Updates the particle.
     */
    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.maxVX !== null) {
        if (this.vx > this.maxVX) {
          this.vx = this.maxVX;
        } else if (this.vx < -this.maxVX) {
          this.vx = -this.maxVX;
        }
      }

      if (this.maxVY !== null) {
        if (this.vy > this.maxVY) {
          this.vy = this.maxVY;
        } else if (this.vy < -this.maxVY) {
          this.vy = -this.maxVY;
        }
      }
    }

    /**
     * Gets the id of the particle.
     * @returns The id of the particle
     */
    getId() {
      return this.id;
    }

    /**
     * Gets the x position of the particle.
     * @returns The x position of the particle
     */
    getX() {
      return this.x;
    }

    /**
     * Sets the x position of the particle.
     * @param x - The x position of the particle
     */
    setX(x: number) {
      this.x = x;
    }

    /**
     * Gets the y position of the particle.
     * @returns The y position of the particle
     */
    getY() {
      return this.y;
    }

    /**
     * Sets the y position of the particle.
     * @param y - The y position of the particle
     */
    setY(y: number) {
      this.y = y;
    }

    /**
     * Gets the width of the particle.
     * @returns The width of the particle
     */
    getWidth() {
      return this.width;
    }

    /**
     * Sets the width of the particle.
     * @param width - The width of the particle
     */
    setWidth(width: number) {
      this.width = width;
    }

    /**
     * Gets the height of the particle.
     * @returns The height of the particle
     */
    getHeight() {
      return this.height;
    }

    /**
     * Sets the height of the particle.
     * @param height - The height of the particle
     */
    setHeight(height: number) {
      this.height = height;
    }

    /**
     * Gets the color of the particle.
     * @returns The color of the particle
     */
    getColor() {
      return this.color;
    }

    /**
     * Sets the color of the particle.
     * @param color - The color of the particle
     */
    setColor(color: string) {
      this.color = color;
    }

    /**
     * Gets the velocity of the particle on the x axis.
     * @returns The velocity of the particle on the x axis
     */
    getVX() {
      return this.vx;
    }

    /**
     * Sets the velocity of the particle on the x axis.
     * @param vx - The velocity of the particle on the x axis
     */
    setVX(vx: number) {
      this.vx = vx;
    }

    /**
     * Gets the velocity of the particle on the y axis.
     * @returns The velocity of the particle on the y axis
     */
    getVY() {
      return this.vy;
    }

    /**
     * Sets the velocity of the particle on the y axis.
     * @param vy - The velocity of the particle on the y axis
     */
    setVY(vy: number) {
      this.vy = vy;
    }

    /**
     * Gets the maximum velocity of the particle on the x axis.
     * @returns The maximum velocity of the particle on the x axis
     */
    getMaxVX() {
      return this.maxVX;
    }

    /**
     * Sets the maximum velocity of the particle on the x axis.
     * @param maxVX - The maximum velocity of the particle on the x axis
     */
    setMaxVX(maxVX: number | null) {
      this.maxVX = maxVX;
    }

    /**
     * Gets the maximum velocity of the particle on the y axis.
     * @returns The maximum velocity of the particle on the y axis
     */
    getMaxVY() {
      return this.maxVY;
    }

    /**
     * Sets the maximum velocity of the particle on the y axis.
     * @param maxVY - The maximum velocity of the particle on the y axis
     */
    setMaxVY(maxVY: number | null) {
      this.maxVY = maxVY;
    }

    /**
     * Gets the transparency of the particle.
     * @returns The transparency of the particle
     */
    getTransparency() {
      return this.transparency;
    }

    /**
     * Sets the transparency of the particle.
     * @param transparency - The transparency of the particle
     */
    setTransparency(transparency: number) {
      this.transparency = transparency;
    }

    /**
     * Gets whether the particle is an eclipse.
     * @returns Whether the particle is an eclipse
     */
    getIsEclipse() {
      return this.isEclipse;
    }

    /**
     * Sets whether the particle is an eclipse.
     * @param isEclipse - Whether the particle is an eclipse
     */
    setIsEclipse(isEclipse: boolean) {
      this.isEclipse = isEclipse;
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

  export const getEngine = (): Engine => engine;
  export let getRender: () => Render;
  export let getLoader: () => Loader;
  export let getEvents: () => Events;
  export let getController: () => Controller;
  export let getGame: () => Game;
  export let getCamera: () => Camera;
}
