/*
 * ███╗   ██╗███████╗██╗   ██╗████████╗██████╗  ██████╗ ███╗   ██╗
 * ████╗  ██║██╔════╝██║   ██║╚══██╔══╝██╔══██╗██╔═══██╗████╗  ██║
 * ██╔██╗ ██║█████╗  ██║   ██║   ██║   ██████╔╝██║   ██║██╔██╗ ██║
 * ██║╚██╗██║██╔══╝  ██║   ██║   ██║   ██╔══██╗██║   ██║██║╚██╗██║
 * ██║ ╚████║███████╗╚██████╔╝   ██║   ██║  ██║╚██████╔╝██║ ╚████║
 * ╚═╝  ╚═══╝╚══════╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
 */

// Neutron Imports
// Change Path to File Location When Needed

import { Render as RenderExtension } from "../main/Render.ts";
import { Game as GameExtension } from "../main/Game.ts";

// Neutron

export namespace Neutron {
  interface EngineSettings {
    update: () => void;
    init: () => void;
    load: () => void;

    tps: number;

    render: RenderExtension;
    game: GameExtension;
    controller: Controller;
    loader: Loader;
    events: Events;
  }

  export class Engine {
    private higherPreformanceUpdateLoop: boolean;

    private idealTps: number;

    private fpsCounter: number;
    private tpsCounter: number;

    private fps: number;
    private tps: number;

    private stopVal: boolean;

    private hasInitialized: boolean;

    private hasLoadedAssets: boolean;

    private update: () => void;
    private initFunc: () => void;

    private lastUpdateTime: number;
    private minFrameTime: number;

    constructor() {
      this.higherPreformanceUpdateLoop = false;

      this.idealTps = 70;

      this.fpsCounter = 0;
      this.tpsCounter = 0;

      this.fps = 0;
      this.tps = 0;

      this.stopVal = false;

      this.hasInitialized = false;

      this.hasLoadedAssets = false;

      this.update = () => {};
      this.initFunc = () => {};

      this.lastUpdateTime = 0;
      this.minFrameTime = 1000 / this.idealTps;
    }

    private startRender = () => {
      if (this.stopVal) {
        window.requestAnimationFrame(this.startRender);
        return;
      }

      if (this.hasLoadedAssets) {
        if (getLoader().getNumberOfAssetsToLoad === 0) {
          this.hasLoadedAssets = false;
        }
        window.requestAnimationFrame(this.startRender);
        return;
      }

      if (!this.hasInitialized) {
        this.initFunc();
        this.hasInitialized = true;
      }

      this.fpsCounter++;

      const currentTime = performance.now();
      const timeSinceLastUpdate = currentTime - this.lastUpdateTime;

      if (timeSinceLastUpdate >= this.minFrameTime) {
        if (this.higherPreformanceUpdateLoop) {
          this.update();
          this.tpsCounter++;
        }
        this.lastUpdateTime = currentTime;
      }

      getRender().getDrawFunction();

      window.requestAnimationFrame(this.startRender);
    };

    private startCheckFPS = () => {
      setInterval(() => {
        this.fps = this.fpsCounter;
        this.tps = this.tpsCounter;
        this.fpsCounter = 0;
        this.tpsCounter = 0;
      }, 1000);
    };

    init(EngineSettings: EngineSettings) {
      getRender = () => {
        return EngineSettings.render;
      };
      getGame = () => {
        return EngineSettings.game;
      };
      getController = () => {
        return EngineSettings.controller;
      };
      getLoader = () => {
        return EngineSettings.loader;
      };

      this.update = () => {
        EngineSettings.game.getSprites.forEach((sprite) => sprite.update());

        const camera = EngineSettings.game.getCamera;
        if (camera.getToFollow) {
          camera.setX =
            camera.getToFollow?.getMovement.getX - getRender().getWidth / 2;
          camera.setY =
            camera.getToFollow?.getMovement.getY - getRender().getHeight / 2;
        }

        if (
          EngineSettings.events.isMouseDown &&
          EngineSettings.events.mouseEvent
        ) {
          EngineSettings.events.whileMouseDown(
            EngineSettings.events.mouseEvent
          );
        }

        EngineSettings.update();
      };

      this.idealTps = EngineSettings.tps;

      EngineSettings.load();

      if (getLoader().getNumberOfAssetsToLoad !== 0) {
        this.hasLoadedAssets = true;
      }

      this.initFunc = EngineSettings.init;

      this.startRender();
      this.startCheckFPS();
    }

    set setHigherPreformanceUpdateLoop(val: boolean) {
      this.higherPreformanceUpdateLoop = val;
    }

    get getFps() {
      return this.fps;
    }
    get getTps() {
      return this.tps;
    }

    stop() {
      this.stopVal = true;
    }
    start() {
      this.stopVal = false;
    }
  }

  export class Render {
    private showExtraInfo: boolean;

    private extraInfoColor: string;

    private dpr: number;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private zoomVal: number;
    private fullScreenRatio: [number, number] | null;

    private draw: () => void;

    constructor(canvas: HTMLCanvasElement, draw: () => void, dpr: number) {
      this.showExtraInfo = false;
      this.extraInfoColor = `#fff`;

      this.canvas = canvas;
      this.dpr = dpr;
      this.ctx = this.setupCanvas(canvas);

      this.zoomVal = 1;
      this.fullScreenRatio = null;

      this.draw = draw;
    }

    private setupCanvas(canvas: HTMLCanvasElement) {
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * this.dpr;
      canvas.height = rect.height * this.dpr;

      const ctx = canvas.getContext(`2d`);

      if (ctx === null) {
        throw new Error(`Canvas context is null!`);
      }

      return ctx;
    }

    private drawFunction() {
      return () => {
        const image = getGame().getBackgroundImage;

        this.getCtx.save();

        if (image === null) {
          this.getCtx.fillStyle = `#000`;
          this.getCtx.fillRect(0, 0, this.getWidth, this.getHeight);
        } else {
          this.getCtx.drawImage(image, 0, 0, this.getWidth, this.getHeight);
        }

        getGame().getSprites.forEach((obj: Sprites.Sprite) => {
          const costumeImage = obj.getCostumes.getCostume();

          if (costumeImage === null) {
            this.drawSprite(obj);
          } else {
            this.drawSpriteImage(obj, costumeImage);
          }

          obj.draw();
        });

        this.draw();

        if (this.showExtraInfo) {
          this.getCtx.fillStyle = this.extraInfoColor;
          this.getCtx.font = `${24 * this.dpr}px serif`;
          this.getCtx.fillText(
            `FPS: ${getEngine().getFps}`,
            20 * this.dpr,
            40 * this.dpr
          );
          this.getCtx.fillText(
            `TPS: ${getEngine().getTps}`,
            20 * this.dpr,
            80 * this.dpr
          );
        }

        this.getCtx.restore();
      };
    }

    setCanvasZoom(zoom: number) {
      let resetValue = this.getWidth / (this.getWidth * this.zoomVal);
      this.getCtx.scale(resetValue, resetValue);
      this.zoomVal = zoom / 100;
      this.getCtx.scale(this.zoomVal, this.zoomVal);
    }

    makeCanvasMatchScreenWidth() {
      this.getCanvas.style.width = `${window.innerWidth}px`;
      this.getCanvas.style.height = `${window.innerHeight}px`;

      this.getCanvas.width = window.innerWidth * this.dpr;
      this.getCanvas.height = window.innerHeight * this.dpr;

      this.getCanvas.style.position = "absolute";
      this.getCanvas.style.left = "0";
      this.getCanvas.style.top = "0";
    }

    makeCanvasCoverFullScreen(xRatio: number, yRatio: number) {
      this.fullScreenRatio = [xRatio, yRatio];
      if (window.innerHeight > window.innerWidth * (yRatio / xRatio)) {
        this.getCanvas.style.width = `${window.innerWidth}px`;
        this.getCanvas.style.height = `${
          window.innerWidth * (yRatio / xRatio)
        }px`;
      } else {
        this.getCanvas.style.width = `${
          window.innerHeight * (xRatio / yRatio)
        }px`;
        this.getCanvas.style.height = `${window.innerHeight}px`;
      }
    }

    drawSprite(object: Sprites.Sprite) {
      if (!object.getEffect.getHidden) {
        this.getCtx.globalAlpha = 1 - object.getEffect.getTransparency / 100;
        this.getCtx.fillStyle = object.getColor;
        this.getCtx.translate(
          object.getMovement.getX +
            object.getDimensions.getWidth / 2 -
            getGame().getCamera.getX,
          object.getMovement.getY +
            object.getDimensions.getHeight / 2 -
            getGame().getCamera.getY
        );
        this.getCtx.rotate((object.getRotation * Math.PI) / 180);
        this.getCtx.translate(
          -(
            object.getMovement.getX +
            object.getDimensions.getWidth / 2 -
            getGame().getCamera.getX
          ),
          -(
            object.getMovement.getY +
            object.getDimensions.getHeight / 2 -
            getGame().getCamera.getY
          )
        );
        if (object.getEclipse) {
          this.ctx.beginPath();
          this.getCtx.ellipse(
            object.getMovement.getX - getGame().getCamera.getX,
            object.getMovement.getY - getGame().getCamera.getY,
            object.getDimensions.getWidth / 2,
            object.getDimensions.getHeight / 2,
            0,
            0,
            2 * Math.PI
          );
          this.getCtx.fill();
          this.getCtx.closePath();
        } else {
          this.getCtx.fillRect(
            object.getMovement.getX - getGame().getCamera.getX,
            object.getMovement.getY - getGame().getCamera.getY,
            object.getDimensions.getWidth,
            object.getDimensions.getHeight
          );
        }
        this.getCtx.setTransform(1, 0, 0, 1, 0, 0);
      }
    }

    drawSpriteImage(object: Sprites.Sprite, image: HTMLImageElement) {
      if (!object.getEffect.getHidden) {
        this.getCtx.globalAlpha = 1 - object.getEffect.getTransparency / 100;
        this.getCtx.fillStyle = object.getColor;
        this.getCtx.translate(
          object.getMovement.getX +
            object.getDimensions.getWidth / 2 -
            getGame().getCamera.getX,
          object.getMovement.getY +
            object.getDimensions.getHeight / 2 -
            getGame().getCamera.getY
        );
        this.getCtx.rotate((object.getRotation * Math.PI) / 180);
        this.getCtx.translate(
          -(
            object.getMovement.getX +
            object.getDimensions.getWidth / 2 -
            getGame().getCamera.getX
          ),
          -(
            object.getMovement.getY +
            object.getDimensions.getHeight / 2 -
            getGame().getCamera.getY
          )
        );
        this.getCtx.drawImage(
          image,
          object.getMovement.getX - getGame().getCamera.getX,
          object.getMovement.getY - getGame().getCamera.getY,
          object.getDimensions.getWidth,
          object.getDimensions.getHeight
        );
        this.getCtx.setTransform(1, 0, 0, 1, 0, 0);
      }
    }

    drawSpriteWithInputs(
      x: number,
      y: number,
      width: number,
      height: number,
      color: string
    ) {
      this.getCtx.fillStyle = color;
      this.getCtx.fillRect(x, y, width, height);
    }

    set setExtraInfoColor(_val: string) {
      this.extraInfoColor = _val;
    }

    get getDrawFunction() {
      return this.drawFunction().bind(this);
    }

    get getCanvas() {
      return this.canvas;
    }

    get getWidth() {
      return this.canvas.width / (this.getCanvasZoom / 100);
    }
    get getHeight() {
      return this.canvas.height / (this.getCanvasZoom / 100);
    }

    get getShowExtraInfo() {
      return this.showExtraInfo;
    }
    set setShowExtraInfo(_val: boolean) {
      this.showExtraInfo = _val;
    }

    get getCtx() {
      return this.ctx;
    }
    get getDpr() {
      return this.dpr;
    }
    get getFullScreenRatios() {
      return this.fullScreenRatio;
    }
    get getCanvasZoom() {
      return this.zoomVal * 100;
    }
  }

  export class Controller {
    private keysDown: { [key: string]: boolean };

    private clientX: number | null;
    private clientY: number | null;

    private mouseX: number | null;
    private mouseY: number | null;

    private eventObject: Events;

    constructor(render: Render, events: Events) {
      this.keysDown = {};

      this.clientX = null;
      this.clientY = null;

      this.mouseX = null;
      this.mouseY = null;

      this.eventObject = events;

      document.onkeydown = (e) => {
        this.keysDown[e.key] = true;

        switch (e.key) {
          case `F2`:
            render.setShowExtraInfo = !render.getShowExtraInfo;
            break;
        }

        this.eventObject.onClick(e);
      };

      document.onkeyup = (e) => {
        this.keysDown[e.key] = false;
        this.eventObject.offClick(e);
      };

      document.addEventListener(`visibilitychange`, () => {
        if (document.visibilityState !== `visible`) {
          for (let key in this.keysDown) this.keysDown[key] = false;
        }
      });

      render.getCanvas.addEventListener(`mousedown`, (e) => {
        this.eventObject.isMouseDown = true;
        this.eventObject.mouseEvent = e;
        this.eventObject.mouseDown(e);
      });

      render.getCanvas.addEventListener(`mouseup`, (e) => {
        this.eventObject.isMouseDown = false;
        this.eventObject.mouseEvent = null;
        this.eventObject.mouseUp(e);
      });

      render.getCanvas.addEventListener(`mousemove`, (e) => {
        const camera = getGame().getCamera;

        const x =
          (e.clientX - Neutron.getRender().getCanvas.offsetLeft) *
            (Neutron.getRender().getWidth /
              Neutron.getRender().getCanvas.getBoundingClientRect().width) +
          camera.getX;
        const y =
          (e.clientY - Neutron.getRender().getCanvas.offsetTop) *
            (Neutron.getRender().getHeight /
              Neutron.getRender().getCanvas.getBoundingClientRect().height) +
          camera.getY;

        this.clientX = e.clientX;
        this.clientY = e.clientY;

        this.setMouseX = x;
        this.setMouseY = y;

        this.eventObject.mouseMove(e);
        this.eventObject.mouseEvent = e;
      });

      render.getCanvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent("mousedown", {
          clientX: touch.clientX,
          clientY: touch.clientY,
        });
        this.eventObject.isMouseDown = true;
        this.eventObject.mouseEvent = mouseEvent;
        this.eventObject.mouseDown(mouseEvent);
      });

      render.getCanvas.addEventListener("touchend", (e) => {
        e.preventDefault();
        const mouseEvent = new MouseEvent("mouseup", {});
        this.eventObject.isMouseDown = false;
        this.eventObject.mouseEvent = null;
        this.eventObject.mouseUp(mouseEvent);
      });

      render.getCanvas.addEventListener("touchmove", (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const camera = getGame().getCamera;

        const x =
          (touch.clientX - getRender().getCanvas.offsetLeft) *
            (getRender().getWidth /
              getRender().getCanvas.getBoundingClientRect().width) +
          camera.getX;
        const y =
          (touch.clientY - getRender().getCanvas.offsetTop) *
            (getRender().getHeight /
              getRender().getCanvas.getBoundingClientRect().height) +
          camera.getY;

        this.clientX = touch.clientX;
        this.clientY = touch.clientY;

        this.setMouseX = x;
        this.setMouseY = y;

        const mouseEvent = new MouseEvent("mousemove", {
          clientX: touch.clientX,
          clientY: touch.clientY,
        });
        this.eventObject.mouseMove(mouseEvent);
        this.eventObject.mouseEvent = mouseEvent;
      });
    }

    getKey(key: string) {
      if (this.keysDown[key] === undefined) return false;
      return this.keysDown[key];
    }

    get getMouseX() {
      if (!this.clientX) {
        return null;
      }

      this.mouseX =
        ((this.clientX || 0) - getRender().getCanvas.offsetLeft) *
          (getRender().getWidth /
            getRender().getCanvas.getBoundingClientRect().width) +
        getGame().getCamera.getX;
      return this.mouseX;
    }
    private set setMouseX(_val: number) {
      this.mouseX = _val;
    }

    get getMouseY() {
      if (!this.clientY) {
        return null;
      }

      this.mouseY =
        ((this.clientY || 0) - getRender().getCanvas.offsetTop) *
          (getRender().getHeight /
            getRender().getCanvas.getBoundingClientRect().height) +
        getGame().getCamera.getY;
      return this.mouseY;
    }
    private set setMouseY(_val: number) {
      this.mouseY = _val;
    }

    get getIsMouseDown() {
      return this.eventObject.isMouseDown;
    }
  }

  export class Loader {
    private images: [string, HTMLImageElement][] = [];
    private assetsToLoad = 0;

    loadImage(id: string, src: string) {
      let image = new Image();
      image.src = src;
      this.images.push([id, image]);
      image.onload = () => this.assetsToLoad--;
      this.assetsToLoad++;
    }

    getLoadedImageById = (id: string) =>
      this.images.filter((image) => image[0] === id)[0][1];

    get getNumberOfAssetsToLoad() {
      return this.assetsToLoad;
    }
  }

  export class Game {
    private sprites: Sprites.Sprite[] = [];

    private background: HTMLImageElement | null = null;

    private camera = new Camera();

    private mapReaderImage = document.createElement(`img`);
    private mapReaderCanvas = document.createElement(`canvas`);

    private sortSprites(arr: Sprites.Sprite[]) {
      arr.sort((a, b) => a.getStageLevel - b.getStageLevel);
      return arr;
    }

    private loadCanvas() {
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
    }

    private doImageMap(
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

    useImageMap(
      image: HTMLImageElement,
      func: (data: Uint8ClampedArray, x: number, y: number) => void
    ) {
      this.mapReaderImage = image;

      this.loadCanvas();

      this.doImageMap(func);

      getEngine().start();
    }

    getLocationOnImageMap(x: number, y: number) {
      const ctx = this.mapReaderCanvas.getContext(`2d`);

      if (ctx === null) {
        throw new Error(`Image map context is null!`);
      }

      ctx.getImageData(x, y, 1, 1);
    }

    addNewSprite(sprites: Sprites.Sprite | Sprites.Sprite[]) {
      if (Array.isArray(sprites)) {
        this.sprites.concat(sprites);
      } else {
        this.sprites.push(sprites);
      }

      this.sprites = this.sortSprites(this.sprites);
    }

    getSpriteById = (id: string) =>
      this.sprites.filter((sprite) => sprite.getId === id)[0];

    getSpritesByType<T extends Sprites.Sprite>(
      constructor: new (...args: any[]) => T
    ): T[] {
      const sprites: Sprites.Sprite[] = this.sprites;
      return sprites.filter(
        (sprite): sprite is T => sprite instanceof constructor
      );
    }

    getPlatformerSprites(): Sprites.Platformer[] {
      const sprites: any[] = this.sprites;
      return sprites.filter((sprite) => sprite instanceof Sprites.Platformer);
    }

    deleteSpriteById = (id: string) => {
      this.sprites = this.sprites.filter((sprite) => sprite.getId !== id);
    };

    deleteSpritesByType = (type: any) => {
      this.sprites = this.sprites.filter((sprite) => sprite! instanceof type);
    };

    deleteSprites = () => {
      this.sprites.length = 0;
    };

    setDynamicBackgroundImage(
      image: HTMLImageElement,
      x: number,
      y: number,
      width: number,
      height: number
    ) {
      const background = new Sprites.Sprite(
        `background`,
        x,
        y,
        width,
        height,
        `#fff`,
        0
      );

      background.getCostumes.addCostume(`set`, image);
      background.getCostumes.setCostumeById(`set`);

      this.addNewSprite(background);
    }

    setStaticBackgroundImage = (image: HTMLImageElement) => {
      this.background = image;
    };

    get getBackgroundImage() {
      return this.background;
    }

    get getCamera() {
      return this.camera;
    }

    get getSprites() {
      return this.sprites;
    }
  }

  export class Events {
    isMouseDown: boolean;
    mouseEvent: MouseEvent | null;

    constructor() {
      this.isMouseDown = false;
      this.mouseEvent = null;
    }

    onClick(_e: KeyboardEvent) {}
    offClick(_e: KeyboardEvent) {}

    mouseDown(_e: MouseEvent) {}
    mouseUp(_e: MouseEvent) {}

    mouseMove(_e: MouseEvent) {}

    whileMouseDown(_e: MouseEvent) {}

    get getIsMouseDown() {
      return this.isMouseDown;
    }
  }

  class Camera {
    private x: number;
    private y: number;

    private toFollow: Sprites.Sprite | null;

    constructor() {
      this.x = 0;
      this.y = 0;
      this.toFollow = null;
    }

    set setToFollow(_val: Sprites.Sprite | null) {
      this.toFollow = _val;
    }

    get getToFollow() {
      return this.toFollow;
    }

    goTo(_valx: number, _valy: number) {
      this.setX = _valx;
      this.setY = _valy;
    }

    get getX() {
      return this.x;
    }
    set setX(_val: number) {
      this.x = Number(_val.toFixed(1));
    }

    get getY() {
      return this.y;
    }
    set setY(_val: number) {
      this.y = Number(_val.toFixed(1));
    }

    get getWidth() {
      return getRender().getWidth;
    }
    get getHeight() {
      return getRender().getHeight;
    }
  }

  export namespace Sprites {
    namespace SpriteObjects {
      export class Costumes {
        private costumes: { [id: string]: HTMLImageElement | null } = {
          NONE: null,
        };

        private id = `NONE`;

        addCostume(id: string, image: HTMLImageElement | null) {
          if (id.toUpperCase() === `NONE`)
            throw new Error(`Cannot Set Costume None!`);
          this.costumes[id] = image;
        }

        setCostumeById(id: string) {
          if (id.toUpperCase() === `NONE`) this.id = `NONE`;
          else this.id = id;
        }

        getCostume = () => this.costumes[this.id];
      }

      export class Sounds {
        private sounds: { [id: string]: HTMLAudioElement } = {};

        addSound(id: string, src: string) {
          let audio = new Audio(src);
          audio.preload = `auto`;
          this.sounds[id] = audio;
        }

        stopSoundById(id: string) {
          this.sounds[id].pause();
          this.sounds[id].currentTime = 0;
        }

        pauseSoundById(id: string) {
          this.sounds[id].pause();
        }

        playSoundById(id: string) {
          this.sounds[id].play();
        }

        setSoundVolumeById(id: string, volume: number) {
          this.sounds[id].volume = volume / 100;
        }
      }

      export class Movement {
        private me: Sprite;

        private x = 0;
        private y = 0;

        constructor(me: Sprite) {
          this.me = me;
        }

        goTo(_valx: number, _valy: number) {
          this.x = _valx;
          this.y = _valy;
        }

        to(place: Enums.ScreenPlaces) {
          switch (place) {
            case Enums.ScreenPlaces.center:
              this.goTo(
                getRender().getWidth / 2 - this.me.getDimensions.getWidth / 2,
                getRender().getHeight / 2 - this.me.getDimensions.getHeight / 2
              );
              break;
            case Enums.ScreenPlaces.verticalCenter:
              this.goTo(
                this.getX,
                getRender().getHeight / 2 - this.me.getDimensions.getHeight / 2
              );
              break;
            case Enums.ScreenPlaces.horizontalCenter:
              this.goTo(
                getRender().getWidth / 2 - this.me.getDimensions.getWidth / 2,
                this.getY
              );
              break;
            case Enums.ScreenPlaces.randomPosition:
              this.goTo(
                Math.floor(Math.random() * getRender().getWidth),
                Math.floor(Math.random() * getRender().getHeight)
              );
              break;
          }
        }

        get getX() {
          return this.x;
        }
        set setX(_val: number) {
          this.x = _val;
          this.x = Number(this.x.toFixed(1));
        }

        get getY() {
          return this.y;
        }
        set setY(_val: number) {
          this.y = _val;
          this.y = Number(this.y.toFixed(1));
        }
      }

      export class Dimensions {
        private width: number = 0;
        private height: number = 0;

        get getWidth() {
          return this.width;
        }
        set setWidth(_val: number) {
          this.width = _val;
          this.width = Number(this.width.toFixed(1));
        }

        get getHeight() {
          return this.height;
        }
        set setHeight(_val: number) {
          this.height = _val;
          this.height = Number(this.height.toFixed(1));
        }
      }

      export class Effects {
        private hidden: boolean;
        private transparency: number;

        constructor(hidden: boolean, transparency: number) {
          this.hidden = hidden;
          this.transparency = transparency;
        }

        clearEffects() {
          this.hidden = false;
          this.transparency = 0;
        }

        get getHidden() {
          return this.hidden;
        }
        set setHidden(_val: boolean) {
          this.hidden = _val;
        }

        get getTransparency() {
          return this.transparency;
        }
        set setTransparency(_val: number) {
          this.transparency = _val;
        }
      }

      export class Collision {
        private me: Sprite;

        constructor(me: Sprite) {
          this.me = me;
        }

        touchingSprite = () =>
          getGame().getSprites.filter(
            (sprite) => this.touching(sprite) && sprite !== this.me
          );

        touching(other: Sprite) {
          if (
            this.me.getMovement.getX <
              other.getMovement.getX + other.getDimensions.getWidth &&
            this.me.getMovement.getX + this.me.getDimensions.getWidth >
              other.getMovement.getX &&
            this.me.getMovement.getY <
              other.getMovement.getY + other.getDimensions.getHeight &&
            this.me.getMovement.getY + this.me.getDimensions.getHeight >
              other.getMovement.getY
          )
            return true;
          return false;
        }

        getSpriteAboveSelf() {
          this.me.getMovement.setY = this.me.getMovement.getY - 1;
          const touchingSprites = getGame().getSprites.filter(
            (sprite) =>
              this.me.getCollision.touching(sprite) && this.me !== sprite
          );
          this.me.getMovement.setY = this.me.getMovement.getY + 1;
          return touchingSprites;
        }

        getSpriteBelowSelf() {
          this.me.getMovement.setY = this.me.getMovement.getY + 1;
          const touchingSprites = getGame().getSprites.filter(
            (sprite) =>
              this.me.getCollision.touching(sprite) && this.me !== sprite
          );
          this.me.getMovement.setY = this.me.getMovement.getY - 1;
          return touchingSprites;
        }

        getSpriteLeftSelf() {
          this.me.getMovement.setX = this.me.getMovement.getX - 1;
          const touchingSprites = getGame().getSprites.filter(
            (sprite) =>
              this.me.getCollision.touching(sprite) && this.me !== sprite
          );
          this.me.getMovement.setX = this.me.getMovement.getX + 1;
          return touchingSprites;
        }

        getSpriteRightSelf() {
          this.me.getMovement.setX = this.me.getMovement.getX + 1;
          const touchingSprites = getGame().getSprites.filter(
            (sprite) =>
              this.me.getCollision.touching(sprite) && this.me !== sprite
          );
          this.me.getMovement.setX = this.me.getMovement.getX - 1;
          return touchingSprites;
        }
      }
    }

    export class Sprite {
      private color: string;

      private id: string;

      private stageLevel: number;

      private rotation = 0;

      private movement = new SpriteObjects.Movement(this);

      private dimensions = new SpriteObjects.Dimensions();

      private costumes = new SpriteObjects.Costumes();

      private sounds = new SpriteObjects.Sounds();

      private effects = new SpriteObjects.Effects(false, 0);

      private collision = new SpriteObjects.Collision(this);

      private eclipse = false;

      constructor(
        id: string,
        x: number,
        y: number,
        width: number,
        height: number,
        color: string,
        stageLevel: number
      ) {
        this.getMovement.setX = x;
        this.getMovement.setY = y;

        this.dimensions.setWidth = width;
        this.dimensions.setHeight = height;

        this.color = color;

        this.stageLevel = stageLevel;

        this.id = id;
      }

      update() {}

      draw() {}

      isOnScreen() {
        if (
          this.movement.getX + this.dimensions.getWidth >=
            getGame().getCamera.getX &&
          this.movement.getX <=
            getGame().getCamera.getX + getRender().getWidth &&
          this.movement.getY + this.dimensions.getHeight >=
            getGame().getCamera.getY &&
          this.movement.getY <= getGame().getCamera.getY + getRender().getHeight
        )
          return true;
        return false;
      }

      get getColor() {
        return this.color;
      }
      set setColor(_val: string) {
        this.color = _val;
      }

      get getStageLevel() {
        return this.stageLevel;
      }
      set setStageLevel(_val: number) {
        this.stageLevel = _val;
      }

      get getRotation() {
        return this.rotation;
      }
      set setRotation(_val: number) {
        this.rotation = _val;
      }

      get getId() {
        return this.id;
      }

      get getMovement() {
        return this.movement;
      }

      get getDimensions() {
        return this.dimensions;
      }

      get getEffect() {
        return this.effects;
      }

      get getCollision() {
        return this.collision;
      }

      get getCostumes() {
        return this.costumes;
      }

      get getSounds() {
        return this.sounds;
      }

      get getEclipse() {
        return this.eclipse;
      }

      set setEclipse(_val: boolean) {
        this.eclipse = _val;
      }
    }

    export class Platformer extends Sprite {
      private vx = 0;
      private vxSpeed = 0.5;
      private maxVX: number | null = null;

      private vy = 0;
      private vySpeed = 0.5;
      private maxVY: number | null = null;

      private gravityAcc = 0.2;

      private hasPlatformerBelow = false;

      private checkAllCollision = true;

      private platformersToCheckCollision = getGame().getPlatformerSprites();

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
      }

      doGravity() {
        this.hasPlatformerBelow = false;

        this.getMovement.setY = this.getMovement.getY + this.getVY;

        if (this.checkAllCollision)
          this.platformersToCheckCollision = getGame().getPlatformerSprites();

        this.platformersToCheckCollision.forEach((platformer) => {
          if (this.getCollision.touching(platformer) && this !== platformer) {
            if (this.getVY < 0)
              this.getMovement.setY =
                platformer.getMovement.getY +
                platformer.getDimensions.getHeight;
            else {
              this.getMovement.setY =
                platformer.getMovement.getY - this.getDimensions.getHeight;

              this.hasPlatformerBelow = true;
            }

            if (this.getCollision.touching(platformer))
              this.getMovement.setY = this.getMovement.getY + 0.1;

            this.setVY = 0;
          }
        });

        if (!this.hasPlatformerBelow)
          this.setVY = this.getVY + this.getGravityAcc;
        else this.setVY = 0;
      }

      moveX(x: number) {
        this.getMovement.setX = this.getMovement.getX + x;

        if (this.checkAllCollision)
          this.platformersToCheckCollision = getGame().getPlatformerSprites();

        const touchingPlatformers = this.platformersToCheckCollision.filter(
          (platformer) =>
            this.getCollision.touching(platformer) && this !== platformer
        );

        touchingPlatformers.forEach((platformer) => {
          if (x > 0)
            this.getMovement.setX =
              platformer.getMovement.getX - this.getDimensions.getWidth;
          else
            this.getMovement.setX =
              platformer.getMovement.getX + platformer.getDimensions.getWidth;
        });
      }

      moveY(y: number) {
        this.getMovement.setY = this.getMovement.getY + y;

        if (this.checkAllCollision)
          this.platformersToCheckCollision = getGame().getPlatformerSprites();

        const touchingPlatformers = this.platformersToCheckCollision.filter(
          (platformer) =>
            this.getCollision.touching(platformer) && this !== platformer
        );

        touchingPlatformers.forEach((platformer) => {
          if (y > 0)
            this.getMovement.setY =
              platformer.getMovement.getY - this.getDimensions.getHeight;
          else
            this.getMovement.setY =
              platformer.getMovement.getY + platformer.getDimensions.getHeight;
        });
      }

      doJump(jumpHeight: number) {
        if (this.getPlatformerBelowSelf().length > 0) this.setVY = -jumpHeight;
      }

      getPlatformerAboveSelf() {
        this.getMovement.setY = this.getMovement.getY - 1;
        const touchingPlatformers = getGame()
          .getPlatformerSprites()
          .filter(
            (sprite) => this.getCollision.touching(sprite) && this !== sprite
          );
        this.getMovement.setY = this.getMovement.getY + 1;
        return touchingPlatformers;
      }

      getPlatformerBelowSelf() {
        this.getMovement.setY = this.getMovement.getY + 1;
        const touchingPlatformers = getGame()
          .getPlatformerSprites()
          .filter(
            (sprite) => this.getCollision.touching(sprite) && this !== sprite
          );
        this.getMovement.setY = this.getMovement.getY - 1;
        return touchingPlatformers;
      }

      getPlatformerLeftSelf() {
        this.getMovement.setX = this.getMovement.getX - 1;
        const touchingPlatformers = getGame()
          .getPlatformerSprites()
          .filter(
            (sprite) => this.getCollision.touching(sprite) && this !== sprite
          );
        this.getMovement.setX = this.getMovement.getX + 1;
        return touchingPlatformers;
      }

      getPlatformerRightSelf() {
        this.getMovement.setX = this.getMovement.getX + 1;
        const touchingPlatformers = getGame()
          .getPlatformerSprites()
          .filter(
            (sprite) => this.getCollision.touching(sprite) && this !== sprite
          );
        this.getMovement.setX = this.getMovement.getX - 1;
        return touchingPlatformers;
      }

      addFrictionX(friction: number) {
        this.setVX = this.vx * friction;
        if (Math.abs(this.getVX) < 0.3) this.setVX = 0;
      }

      addFrictionY(friction: number) {
        this.setVY = this.vy * friction;
        if (Math.abs(this.getVY) < 0.3) this.setVY = 0;
      }

      get getVX() {
        return this.vx;
      }
      set setVX(_val: number) {
        this.vx = _val;
        this.vx = Number(this.vx.toFixed(1));
        if (this.maxVX !== null && this.vx > this.maxVX) this.vx = this.maxVX;
        else if (this.maxVX !== null && this.vx < -this.maxVX)
          this.vx = -this.maxVX;
      }

      get getVXSpeed() {
        return this.vxSpeed;
      }
      set setVXSpeed(_val: number) {
        this.vxSpeed = _val;
        this.vxSpeed = Number(this.vxSpeed.toFixed(1));
      }

      get getMaxVX() {
        return this.maxVX;
      }
      set setMaxVX(_val: number | null) {
        this.maxVX = _val;
      }

      get getVY() {
        return this.vy;
      }
      set setVY(_val: number) {
        this.vy = _val;
        this.vy = Number(this.vy.toFixed(1));
        if (this.maxVY !== null && this.vy > this.maxVY) this.vy = this.maxVY;
        else if (this.maxVY !== null && this.vy < -this.maxVY)
          this.vy = -this.maxVY;
      }

      get getVYSpeed() {
        return this.vySpeed;
      }
      set setVYSpeed(_val: number) {
        this.vySpeed = _val;
        this.vySpeed = Number(this.vySpeed.toFixed(1));
      }

      get getMaxVY() {
        return this.maxVY;
      }
      set setMaxVY(_val: number | null) {
        this.maxVY = _val;
      }

      get getGravityAcc() {
        return this.gravityAcc;
      }
      set setGravityAcc(_val: number) {
        this.gravityAcc = _val;
      }

      get getPlatformersToCheckCollision() {
        return this.platformersToCheckCollision;
      }

      set setPlatformerSpritesToCheckCollisionWith(_val: Platformer[]) {
        this.platformersToCheckCollision = _val;

        if (_val !== getGame().getPlatformerSprites())
          this.checkAllCollision = false;
      }
    }
  }

  export namespace Enums {
    export enum ScreenPlaces {
      center,
      verticalCenter,
      horizontalCenter,
      randomPosition,
    }
  }

  const engine = new Engine();

  export const getEngine = () => engine;
  export let getLoader: () => Loader;
  export let getRender: () => RenderExtension;
  export let getGame: () => GameExtension;
  export let getController: () => Controller;
}
