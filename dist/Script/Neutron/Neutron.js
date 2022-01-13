// Neutron Imports
// Change Path to File Location When Needed
// Neutron
export var Neutron;
(function (Neutron) {
    class Engine {
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
            this.update = () => { };
            this.draw = () => { };
            this.initFunc = () => { };
            this.startRender = () => {
                if (!this.stopVal) {
                    if (!this.hasLoadedAssets) {
                        if (!this.hasInitialized) {
                            this.initFunc();
                            this.hasInitialized = true;
                        }
                        this.fpsCounter++;
                        if (this.higherPreformanceUpdateLoop)
                            this.update();
                        Neutron.getRender().getDrawFunction();
                        this.draw();
                    }
                    else {
                        if (Neutron.getLoader().getNumberOfAssetsToLoad === 0)
                            this.hasLoadedAssets = false;
                    }
                }
                window.requestAnimationFrame(this.startRender);
            };
            this.startCheckFPS = () => {
                setInterval(() => {
                    this.fps = this.fpsCounter;
                    this.tps = this.tpsCounter;
                    this.fpsCounter = 0;
                    this.tpsCounter = 0;
                }, 1000);
            };
        }
        startUpdate() {
            setInterval(() => {
                if (!this.stopVal && this.tpsCounter < this.idealTps) {
                    this.tpsCounter++;
                    if (!this.higherPreformanceUpdateLoop)
                        this.update();
                }
            }, 1000 / this.idealTps);
        }
        init(EngineSettings) {
            Neutron.getRender = () => { return EngineSettings.render; };
            Neutron.getGame = () => { return EngineSettings.game; };
            Neutron.getController = () => { return EngineSettings.controller; };
            Neutron.getLoader = () => { return EngineSettings.loader; };
            this.update = EngineSettings.update;
            this.draw = EngineSettings.draw;
            this.initFunc = () => { };
            this.idealTps = EngineSettings.tps;
            EngineSettings.load();
            if (Neutron.getLoader().getNumberOfAssetsToLoad !== 0)
                this.hasLoadedAssets = true;
            this.initFunc = EngineSettings.init;
            this.startRender();
            this.startUpdate();
            this.startCheckFPS();
        }
        set setHigherPreformanceUpdateLoop(val) { this.higherPreformanceUpdateLoop = val; }
        get getFps() { return this.fps; }
        get getTps() { return this.tps; }
        stop() { this.stopVal = true; }
        start() { this.stopVal = false; }
    }
    Neutron.Engine = Engine;
    class Render {
        constructor(canvas, draw, dpr) {
            this.showExtraInfo = false;
            this.zoomVal = 1;
            this.fullScreenRatio = null;
            this.canvas = canvas;
            this.dpr = dpr;
            this.ctx = this.setupCanvas(canvas);
            this.draw = draw;
        }
        setupCanvas(canvas) {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * this.dpr;
            canvas.height = rect.height * this.dpr;
            const ctx = canvas.getContext(`2d`);
            if (ctx === null)
                throw new Error(`Main canvas ctx null!`);
            return ctx;
        }
        drawFunction() {
            return () => {
                const image = Neutron.getGame().getBackgroundImage;
                this.getCtx.save();
                if (image === null) {
                    this.getCtx.fillStyle = `black`;
                    this.getCtx.fillRect(0, 0, this.getWidth, this.getHeight);
                }
                else {
                    this.getCtx.drawImage(image, 0, 0, this.getWidth, this.getHeight);
                }
                Neutron.getGame().getSprites.forEach((obj) => {
                    const costumeImage = obj.getCostumes.getCostume();
                    if (costumeImage === null)
                        this.drawSprite(obj);
                    else
                        this.drawSpriteImage(obj, costumeImage);
                });
                this.draw();
                if (this.showExtraInfo) {
                    this.getCtx.fillStyle = `white`;
                    this.getCtx.font = `24px serif`;
                    this.getCtx.fillText(`FPS: ${Neutron.getEngine().getFps}`, 20, 40);
                    this.getCtx.fillText(`TPS: ${Neutron.getEngine().getTps}`, 20, 80);
                }
                this.getCtx.restore();
            };
        }
        setCanvasZoom(zoom) {
            let resetValue = this.getWidth / (this.getWidth * this.zoomVal);
            this.getCtx.scale(resetValue, resetValue);
            this.zoomVal = zoom / 100;
            this.getCtx.scale(this.zoomVal, this.zoomVal);
        }
        makeCanvasCoverFullScreen(xRatio, yRatio) {
            this.fullScreenRatio = [xRatio, yRatio];
            if (window.innerHeight > window.innerWidth * (yRatio / xRatio)) {
                this.getCanvas.style.width = `${window.innerWidth}px`;
                this.getCanvas.style.height = `${window.innerWidth * (yRatio / xRatio)}px`;
            }
            else {
                this.getCanvas.style.width = `${window.innerHeight * (xRatio / yRatio)}px`;
                this.getCanvas.style.height = `${window.innerHeight}px`;
            }
        }
        drawSprite(object) {
            if (!object.getEffect.getHidden) {
                this.getCtx.globalAlpha = 1 - (object.getEffect.getTransparency / 100);
                this.getCtx.fillStyle = object.getColor;
                this.getCtx.fillRect(object.getMovement.getX - Neutron.getGame().getCamera.getX, object.getMovement.getY - Neutron.getGame().getCamera.getY, object.getDimensions.getWidth, object.getDimensions.getHeight);
            }
        }
        drawSpriteImage(object, image) {
            if (!object.getEffect.getHidden) {
                this.getCtx.globalAlpha = 1 - (object.getEffect.getTransparency / 100);
                this.getCtx.fillStyle = object.getColor;
                this.getCtx.drawImage(image, object.getMovement.getX - Neutron.getGame().getCamera.getX, object.getMovement.getY - Neutron.getGame().getCamera.getY, object.getDimensions.getWidth, object.getDimensions.getHeight);
            }
        }
        drawSpriteWithInputs(x, y, width, height, color) {
            this.getCtx.fillStyle = color;
            this.getCtx.fillRect(x, y, width, height);
        }
        get getDrawFunction() { return this.drawFunction().bind(this); }
        get getCanvas() { return this.canvas; }
        get getWidth() { return this.canvas.width / (this.getCanvasZoom / 100); }
        get getHeight() { return this.canvas.height / (this.getCanvasZoom / 100); }
        get getShowExtraInfo() { return this.showExtraInfo; }
        ;
        set setShowExtraInfo(_val) { this.showExtraInfo = _val; }
        get getCtx() { return this.ctx; }
        get getDpr() { return this.dpr; }
        get getFullScreenRatios() { return this.fullScreenRatio; }
        get getCanvasZoom() { return this.zoomVal * 100; }
    }
    Neutron.Render = Render;
    class Controller {
        constructor(render, events) {
            this.keysDown = {};
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
                    for (let key in this.keysDown)
                        this.keysDown[key] = false;
                }
            });
            render.getCanvas.addEventListener(`mousedown`, (e) => this.eventObject.mouseDown(e));
            render.getCanvas.addEventListener(`mousemove`, (e) => {
                const x = ((e.clientX - Neutron.getRender().getCanvas.offsetLeft) * (Neutron.getRender().getWidth / Neutron.getRender().getCanvas.getBoundingClientRect().width));
                const y = ((e.clientY - Neutron.getRender().getCanvas.offsetTop) * (Neutron.getRender().getHeight / Neutron.getRender().getCanvas.getBoundingClientRect().height));
                this.setMouseX = x;
                this.setMouseY = y;
                this.eventObject.mouseMove(e);
            });
        }
        getKey(key) {
            if (this.keysDown[key] === undefined)
                return false;
            return this.keysDown[key];
        }
        get getMouseX() { return this.mouseX; }
        set setMouseX(_val) { this.mouseX = _val; }
        get getMouseY() { return this.mouseY; }
        set setMouseY(_val) { this.mouseY = _val; }
    }
    Neutron.Controller = Controller;
    class Loader {
        constructor() {
            this.images = [];
            this.assetsToLoad = 0;
            this.getLoadedImageById = (id) => (this.images.filter(image => image[0] === id))[0][1];
        }
        loadImage(id, src) {
            let image = new Image();
            image.src = src;
            this.images.push([id, image]);
            image.onload = () => this.assetsToLoad--;
            this.assetsToLoad++;
        }
        get getNumberOfAssetsToLoad() { return this.assetsToLoad; }
    }
    Neutron.Loader = Loader;
    class Game {
        constructor() {
            this.sprites = [];
            this.background = null;
            this.camera = new Camera();
            this.mapReaderImage = document.createElement(`img`);
            this.mapReaderCanvas = document.createElement(`canvas`);
            this.getSpriteById = (id) => this.sprites.filter(sprite => sprite.getId === id)[0];
            this.deleteSpriteById = (id) => { this.sprites = this.sprites.filter(sprite => sprite.getId !== id); };
            this.deleteSpritesByType = (type) => { this.sprites = this.sprites.filter(sprite => sprite instanceof type); };
            this.deleteSprites = () => { this.sprites.length = 0; };
            this.setStaticBackgroundImage = (image) => { this.background = image; };
        }
        sortSprites(arr) {
            for (let i = 0; i < arr.length; i++) {
                for (let j = 0; j < (arr.length - i - 1); j++) {
                    if (arr[j].getStageLevel > arr[j + 1].getStageLevel) {
                        let temp = arr[j];
                        arr[j] = arr[j + 1];
                        arr[j + 1] = temp;
                    }
                }
            }
            return arr;
        }
        loadCanvas() {
            this.mapReaderCanvas.width = this.mapReaderImage.width;
            this.mapReaderCanvas.height = this.mapReaderImage.height;
            const ctx = this.mapReaderCanvas.getContext(`2d`);
            if (ctx === null)
                throw new Error(`Image map canvas ctx null!`);
            ctx.drawImage(this.mapReaderImage, 0, 0, this.mapReaderImage.width, this.mapReaderImage.height);
        }
        doImageMap(func) {
            for (let h = 0; h < this.mapReaderCanvas.height; h++) {
                for (let w = 0; w < this.mapReaderCanvas.width; w++) {
                    const ctx = this.mapReaderCanvas.getContext(`2d`);
                    if (ctx === null)
                        throw new Error(`Image map canvas ctx null!`);
                    const data = ctx.getImageData(w, h, 1, 1).data;
                    func(data, w, h);
                }
            }
        }
        useImageMap(image, func) {
            this.mapReaderImage = image;
            this.loadCanvas();
            this.doImageMap(func);
            Neutron.getEngine().start();
        }
        getLocationOnImageMap(x, y) {
            const ctx = this.mapReaderCanvas.getContext(`2d`);
            if (ctx === null)
                throw new Error(`Image map canvas ctx null!`);
            ctx.getImageData(x, y, 1, 1);
        }
        addNewSprite(sprites) {
            if (Array.isArray(sprites))
                this.sprites.concat(sprites);
            else
                this.sprites.push(sprites);
            this.sprites = this.sortSprites(this.sprites);
        }
        getSpritesByType(arg) {
            const sprites = this.sprites;
            return sprites.filter(sprite => sprite instanceof arg);
        }
        setDynamicBackgroundImage(image, x, y, width, height) {
            const background = new Sprites.Sprite(`background`, x, y, width, height, `#fff`, 0);
            background.getCostumes.addCostume(`set`, image);
            background.getCostumes.setCostumeById(`set`);
            this.addNewSprite(background);
        }
        get getBackgroundImage() { return this.background; }
        get getCamera() { return this.camera; }
        get getSprites() { return this.sprites; }
    }
    Neutron.Game = Game;
    class Events {
        onClick(e) { }
        offClick(e) { }
        mouseDown(e) { }
        mouseMove(e) { }
    }
    Neutron.Events = Events;
    class Camera {
        constructor() {
            this.x = 0;
            this.y = 0;
        }
        goTo(_valx, _valy) {
            this.setX = _valx;
            this.setY = _valy;
        }
        get getX() { return this.x; }
        set setX(_val) { this.x = Number(_val.toFixed(1)); }
        get getY() { return this.y; }
        set setY(_val) { this.y = Number(_val.toFixed(1)); }
        get getWidth() { return Neutron.getRender().getWidth; }
        get getHeight() { return Neutron.getRender().getHeight; }
    }
    let Sprites;
    (function (Sprites) {
        let ScreenPlaces;
        (function (ScreenPlaces) {
            ScreenPlaces[ScreenPlaces["randomPosition"] = 0] = "randomPosition";
            ScreenPlaces[ScreenPlaces["center"] = 1] = "center";
        })(ScreenPlaces = Sprites.ScreenPlaces || (Sprites.ScreenPlaces = {}));
        ;
        let SpriteObjects;
        (function (SpriteObjects) {
            class Costumes {
                constructor() {
                    this.costumes = { 'NONE': null };
                    this.id = `NONE`;
                    this.getCostume = () => this.costumes[this.id];
                }
                addCostume(id, image) {
                    if (id.toUpperCase() === `NONE`)
                        throw new Error(`Cannot Set Costume None!`);
                    this.costumes[id] = image;
                }
                setCostumeById(id) {
                    if (id.toUpperCase() === `NONE`)
                        this.id = `NONE`;
                    else
                        this.id = id;
                }
            }
            SpriteObjects.Costumes = Costumes;
            class Sounds {
                constructor() {
                    this.sounds = {};
                }
                addSound(id, src) {
                    let audio = new Audio(src);
                    audio.preload = `auto`;
                    this.sounds[id] = audio;
                }
                stopSoundById(id) {
                    this.sounds[id].pause();
                    this.sounds[id].currentTime = 0;
                }
                pauseSoundById(id) { this.sounds[id].pause(); }
                playSoundById(id) { this.sounds[id].play(); }
                setSoundVolumeById(id, volume) { this.sounds[id].volume = volume / 100; }
            }
            SpriteObjects.Sounds = Sounds;
            class Movement {
                constructor(me) {
                    this.x = 0;
                    this.y = 0;
                    this.me = me;
                }
                goTo(_valx, _valy) {
                    this.x = _valx;
                    this.y = _valy;
                }
                to(place) {
                    switch (place) {
                        case ScreenPlaces.center:
                            this.goTo(Neutron.getRender().getWidth / 2 - this.me.getDimensions.getWidth / 2, Neutron.getRender().getHeight / 2 - this.me.getDimensions.getHeight / 2);
                            break;
                        case ScreenPlaces.randomPosition:
                            this.goTo(Math.floor(Math.random() * Neutron.getRender().getWidth), Math.floor(Math.random() * Neutron.getRender().getHeight));
                            break;
                    }
                }
                get getX() { return this.x; }
                set setX(_val) {
                    this.x = _val;
                    this.x = Number(this.x.toFixed(1));
                }
                get getY() { return this.y; }
                set setY(_val) {
                    this.y = _val;
                    this.y = Number(this.y.toFixed(1));
                }
            }
            SpriteObjects.Movement = Movement;
            class Dimensions {
                constructor() {
                    this.width = 0;
                    this.height = 0;
                }
                get getWidth() { return this.width; }
                set setWidth(_val) {
                    this.width = _val;
                    this.width = Number(this.width.toFixed(1));
                }
                get getHeight() { return this.height; }
                set setHeight(_val) {
                    this.height = _val;
                    this.height = Number(this.height.toFixed(1));
                }
            }
            SpriteObjects.Dimensions = Dimensions;
            class Effects {
                constructor(hidden, transparency) {
                    this.hidden = hidden;
                    this.transparency = transparency;
                }
                clearEffects() {
                    this.hidden = false;
                    this.transparency = 0;
                }
                get getHidden() { return this.hidden; }
                set setHidden(_val) { this.hidden = _val; }
                get getTransparency() { return this.transparency; }
                set setTransparency(_val) { this.transparency = _val; }
            }
            SpriteObjects.Effects = Effects;
            class Collision {
                constructor(me) {
                    this.touchingSprite = () => Neutron.getGame().getSprites.filter(sprite => this.touching(this.me) && sprite !== this.me);
                    this.me = me;
                }
                touching(other) {
                    if (this.me.getMovement.getX < other.getMovement.getX + other.getDimensions.getWidth &&
                        this.me.getMovement.getX + this.me.getDimensions.getWidth > other.getMovement.getX &&
                        this.me.getMovement.getY < other.getMovement.getY + other.getDimensions.getHeight &&
                        this.me.getMovement.getY + this.me.getDimensions.getHeight > other.getMovement.getY)
                        return true;
                    return false;
                }
            }
            SpriteObjects.Collision = Collision;
        })(SpriteObjects || (SpriteObjects = {}));
        class Sprite {
            constructor(id, x, y, width, height, color, stageLevel) {
                this.movement = new SpriteObjects.Movement(this);
                this.dimensions = new SpriteObjects.Dimensions();
                this.costumes = new SpriteObjects.Costumes();
                this.sounds = new SpriteObjects.Sounds();
                this.effects = new SpriteObjects.Effects(false, 0);
                this.collision = new SpriteObjects.Collision(this);
                this.getMovement.setX = x;
                this.getMovement.setY = y;
                this.dimensions.setWidth = width;
                this.dimensions.setHeight = height;
                this.color = color;
                this.stageLevel = stageLevel;
                this.id = id;
            }
            isOnScreen() {
                if (this.movement.getX + this.dimensions.getWidth >= Neutron.getGame().getCamera.getX &&
                    this.movement.getX <= Neutron.getGame().getCamera.getX + Neutron.getRender().getWidth &&
                    this.movement.getY + this.dimensions.getHeight >= Neutron.getGame().getCamera.getY &&
                    this.movement.getY <= Neutron.getGame().getCamera.getY + Neutron.getRender().getHeight)
                    return true;
                return false;
            }
            get getColor() { return this.color; }
            set setColor(_val) { this.color = _val; }
            get getStageLevel() { return this.stageLevel; }
            set setStageLevel(_val) { this.stageLevel = _val; }
            get getId() { return this.id; }
            get getMovement() { return this.movement; }
            get getDimensions() { return this.dimensions; }
            get getEffect() { return this.effects; }
            get getCollision() { return this.collision; }
            get getCostumes() { return this.costumes; }
            get getSounds() { return this.sounds; }
        }
        Sprites.Sprite = Sprite;
    })(Sprites = Neutron.Sprites || (Neutron.Sprites = {}));
    const engine = new Engine();
    Neutron.getEngine = () => engine;
})(Neutron || (Neutron = {}));
