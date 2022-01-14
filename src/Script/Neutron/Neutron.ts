// Neutron Imports
// Change Path to File Location When Needed

import { Render as RenderExtension } from "../MainClasses/Render.js";
import { Game as GameExtension } from "../MainClasses/Game.js";

// Neutron

export namespace Neutron {

    interface EngineSettings {
        update:() => void, 
        draw:() => void,
        init:() => void, 
        load:() => void,

        tps:number,

        render:RenderExtension, 
        game:GameExtension, 
        controller:Controller, 
        loader:Loader, 
    }

    export class Engine {
        private higherPreformanceUpdateLoop = false;

        private idealTps = 70;

        private fpsCounter = 0;
        private tpsCounter = 0;

        private fps = 0;
        private tps = 0;

        private stopVal = false;

        private hasInitialized = false;

        private hasLoadedAssets = false;

        private update = () => {};
        private draw = () => {};
        private initFunc = () => {};

        private startRender = () => {
            if (!this.stopVal) {
                if (!this.hasLoadedAssets) {
                    if (!this.hasInitialized) {
                        this.initFunc();
                        this.hasInitialized = true;
                    }
                    this.fpsCounter ++;
                    if (this.higherPreformanceUpdateLoop)
                        this.update();
                    getRender().getDrawFunction();
                    this.draw();
                }
                else {
                    if (getLoader().getNumberOfAssetsToLoad === 0)
                        this.hasLoadedAssets = false;
                }
            }
            window.requestAnimationFrame(this.startRender);
        }

        private startUpdate() {
            setInterval(() => {
                if(!this.stopVal && this.tpsCounter < this.idealTps) {
                    this.tpsCounter ++;
                    if (!this.higherPreformanceUpdateLoop)
                        this.update();
                }
            }, 1000 / this.idealTps);
        }

        private startCheckFPS=()=>{
            setInterval(()=>{
                this.fps = this.fpsCounter;
                this.tps = this.tpsCounter;
                this.fpsCounter = 0;
                this.tpsCounter = 0;
            }, 1000);
        }

        init(EngineSettings:EngineSettings){
            getRender = () => { return EngineSettings.render }
            getGame = () => { return EngineSettings.game }
            getController = () => { return EngineSettings.controller }
            getLoader = () => { return EngineSettings.loader }

            this.update = EngineSettings.update;
            this.draw = EngineSettings.draw;
            this.initFunc = () => {};

            this.idealTps = EngineSettings.tps;

            EngineSettings.load();

            if(getLoader().getNumberOfAssetsToLoad !== 0)
                this.hasLoadedAssets=true;
            
            this.initFunc = EngineSettings.init;

            this.startRender();
            this.startUpdate();
            this.startCheckFPS();
        }

        set setHigherPreformanceUpdateLoop(val:boolean) { this.higherPreformanceUpdateLoop = val }

        get getFps() { return this.fps }
        get getTps() { return this.tps }

        stop() { this.stopVal = true }
        start() { this.stopVal = false }
    }

    export class Render {
        private showExtraInfo = false;

        private ctx:CanvasRenderingContext2D;
        private canvas:HTMLCanvasElement;
        private dpr:number;

        private zoomVal = 1;
        private fullScreenRatio:[number,number] | null = null;

        private draw:() => void;

        constructor (canvas:HTMLCanvasElement, draw:() => void, dpr:number) {
            this.canvas = canvas;
            this.dpr = dpr;
            this.ctx = this.setupCanvas(canvas);

            this.draw = draw;
        }

        private setupCanvas(canvas:HTMLCanvasElement) {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * this.dpr;
            canvas.height = rect.height * this.dpr;
            const ctx = canvas.getContext(`2d`);
            if (ctx === null)
                throw new Error(`Main canvas ctx null!`)
            return ctx;
        }

        private drawFunction() {
            return () => {
                const image = getGame().getBackgroundImage;

                this.getCtx.save();

                if (image === null) {
                    this.getCtx.fillStyle = `black`;
                    this.getCtx.fillRect(0, 0, this.getWidth, this.getHeight);
                }
                else {
                    this.getCtx.drawImage(image, 0, 0, this.getWidth, this.getHeight)
                }

                getGame().getSprites.forEach((obj:Sprites.Sprite) => {
                    const costumeImage = obj.getCostumes.getCostume();
        
                    if (costumeImage === null)
                        this.drawSprite(obj);
                    else
                        this.drawSpriteImage(obj, costumeImage);

                });

                this.draw();

                if (this.showExtraInfo) {
                    this.getCtx.fillStyle=`white`;
                    this.getCtx.font=`24px serif`;
                    this.getCtx.fillText(`FPS: ${getEngine().getFps}`,20,40);
                    this.getCtx.fillText(`TPS: ${getEngine().getTps}`,20,80);
                }

                this.getCtx.restore();
            }
        }

        setCanvasZoom(zoom:number) {
            let resetValue = this.getWidth / (this.getWidth * this.zoomVal);
            this.getCtx.scale(resetValue, resetValue);
            this.zoomVal = zoom / 100;
            this.getCtx.scale(this.zoomVal, this.zoomVal);
        }

        makeCanvasCoverFullScreen(xRatio:number, yRatio:number){
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

        drawSprite(object:Sprites.Sprite) {
            if (!object.getEffect.getHidden) {
                this.getCtx.globalAlpha = 1 - (object.getEffect.getTransparency / 100);
                this.getCtx.fillStyle = object.getColor;
                this.getCtx.fillRect(object.getMovement.getX - getGame().getCamera.getX, object.getMovement.getY - getGame().getCamera.getY, object.getDimensions.getWidth, object.getDimensions.getHeight);
            }
        }

        drawSpriteImage(object:Sprites.Sprite, image:HTMLImageElement){
            if (!object.getEffect.getHidden) {
                this.getCtx.globalAlpha = 1 - (object.getEffect.getTransparency / 100);
                this.getCtx.fillStyle = object.getColor;
                this.getCtx.drawImage(image,object.getMovement.getX - getGame().getCamera.getX, object.getMovement.getY - getGame().getCamera.getY, object.getDimensions.getWidth, object.getDimensions.getHeight);
            }
        }

        drawSpriteWithInputs(x:number, y:number, width:number, height:number, color:string){
            this.getCtx.fillStyle = color;
            this.getCtx.fillRect(x, y, width, height);
        }

        get getDrawFunction() { return this.drawFunction().bind(this) }

        get getCanvas() { return this.canvas }

        get getWidth(){ return this.canvas.width / (this.getCanvasZoom / 100) }
        get getHeight(){ return this.canvas.height / (this.getCanvasZoom / 100) }

        get getShowExtraInfo(){ return this.showExtraInfo };
        set setShowExtraInfo(_val:boolean){ this.showExtraInfo = _val }

        get getCtx() { return this.ctx }
        get getDpr(){ return this.dpr }
        get getFullScreenRatios() { return this.fullScreenRatio }
        get getCanvasZoom() { return this.zoomVal * 100 }
    }

    export class Controller {

        private keysDown:{ [key: string]: boolean; } = {};

        private mouseX:number|null = null;
        private mouseY:number|null = null;

        private eventObject:Events;

        constructor (render:Render, events:Events) {
            this.eventObject = events;

            document.onkeydown = (e) => {
                this.keysDown[e.key] = true;

                switch (e.key) {
                    case`F2`:
                        render.setShowExtraInfo = !render.getShowExtraInfo;
                        break;
                }

                this.eventObject.onClick(e);
            }

            document.onkeyup = (e) => {
                this.keysDown[e.key] = false;
                this.eventObject.offClick(e);
            }

            document.addEventListener(`visibilitychange`, () => {
                if (document.visibilityState !== `visible`) {

                    for (let key in this.keysDown)
                        this.keysDown[key] = false;
                    
                }
            });

            render.getCanvas.addEventListener(`mousedown`, (e) => this.eventObject.mouseDown(e));

            render.getCanvas.addEventListener(`mousemove`, (e) => {
                const x = ( ( e.clientX-getRender().getCanvas.offsetLeft ) * ( getRender().getWidth / getRender().getCanvas.getBoundingClientRect().width ) );
                const y = ( ( e.clientY-getRender().getCanvas.offsetTop ) * ( getRender().getHeight / getRender().getCanvas.getBoundingClientRect().height ) );
                
                this.setMouseX = x;
                this.setMouseY = y;

                this.eventObject.mouseMove(e);
            });
        }

        getKey(key:string){
            if (this.keysDown[key]===undefined) 
                return false;
            return this.keysDown[key];
        }
        
        get getMouseX() { return this.mouseX }
        private set setMouseX(_val:number) { this.mouseX = _val }

        get getMouseY() { return this.mouseY }
        private set setMouseY(_val:number) {this.mouseY = _val }
    }

    export class Loader {

        private images:[string, HTMLImageElement][] = [];
        private assetsToLoad = 0;

        loadImage(id:string,src:string) {
            let image = new Image();
            image.src = src;
            this.images.push( [id, image] );
            image.onload = () => this.assetsToLoad --;
            this.assetsToLoad ++;
        }

        getLoadedImageById = (id:string):HTMLImageElement|null => (this.images.filter(image => image[0] === id))[0][1];

        get getNumberOfAssetsToLoad() { return this.assetsToLoad }
    }

    export class Game {
        private sprites:Sprites.Sprite[] = [];

        private background:HTMLImageElement|null = null;

        private camera = new Camera();

        private mapReaderImage = document.createElement(`img`);
        private mapReaderCanvas = document.createElement(`canvas`);

        private sortSprites(arr:Sprites.Sprite[]) {

            for (let i = 0; i < arr.length; i++) {

                for (let j = 0; j < ( arr.length - i -1 ); j++) {

                    if(arr[j].getStageLevel > arr[j+1].getStageLevel) {
                        let temp = arr[j];
                        arr[j] = arr[j + 1];
                        arr[j+1] = temp;
                    }

                }

            }

            return arr;
        }

        private loadCanvas() {
            this.mapReaderCanvas.width = this.mapReaderImage.width;
            this.mapReaderCanvas.height = this.mapReaderImage.height;

            const ctx = this.mapReaderCanvas.getContext(`2d`);

            if (ctx === null)
                throw new Error(`Image map canvas ctx null!`);

            ctx.drawImage(this.mapReaderImage, 0, 0, this.mapReaderImage.width, this.mapReaderImage.height);
        }

        private doImageMap(func:(data:Uint8ClampedArray, x:number, y:number) => void) {

            for (let h = 0; h < this.mapReaderCanvas.height; h ++) {
                
                for (let w = 0; w < this.mapReaderCanvas.width; w ++) {
                    const ctx = this.mapReaderCanvas.getContext(`2d`);

                    if (ctx === null)
                        throw new Error(`Image map canvas ctx null!`);

                    const data = ctx.getImageData(w, h, 1, 1).data;

                    func(data, w, h);
                }

            }

        }

        useImageMap(image:HTMLImageElement, func:(data:Uint8ClampedArray, x:number, y:number) => void){
            this.mapReaderImage = image;

            this.loadCanvas();

            this.doImageMap(func);

            getEngine().start();
        }
        
        getLocationOnImageMap(x:number,y:number) {
            const ctx = this.mapReaderCanvas.getContext(`2d`);

            if (ctx === null)
                    throw new Error(`Image map canvas ctx null!`);

            ctx.getImageData(x, y, 1, 1);
        }

        addNewSprite(sprites:Sprites.Sprite | Sprites.Sprite[]) {

            if (Array.isArray(sprites))
                this.sprites.concat(sprites)
            else
                this.sprites.push(sprites);

            this.sprites = this.sortSprites(this.sprites);
        }

        getSpriteById = (id:string):Sprites.Sprite => this.sprites.filter(sprite => sprite.getId === id)[0];

        getSpritesByType <T>(arg:any):T[] {
            const sprites:any[] = this.sprites;
            return sprites.filter(sprite => sprite instanceof arg);
        }
 
        deleteSpriteById = (id:string) => { this.sprites = this.sprites.filter(sprite => sprite.getId !== id) }

        deleteSpritesByType = (type:any) => { this.sprites = this.sprites.filter(sprite => sprite !instanceof type) }

        deleteSprites = () => { this.sprites.length = 0 }

        setDynamicBackgroundImage(image:HTMLImageElement, x:number, y:number, width:number, height:number) {
            const background = new Sprites.Sprite(`background`, x, y, width, height, `#fff`, 0);

            background.getCostumes.addCostume(`set`, image);
            background.getCostumes.setCostumeById(`set`);

            this.addNewSprite(background);
        }

        setStaticBackgroundImage = (image:HTMLImageElement) => { this.background = image };

        get getBackgroundImage() { return this.background }

        get getCamera() { return this.camera }

        get getSprites() { return this.sprites }
    }

    export class Events {

        onClick(e:KeyboardEvent):void {}
        offClick(e:KeyboardEvent):void {}

        mouseDown(e:MouseEvent):void {}
        mouseMove(e:MouseEvent):void {}

    }

    class Camera {
        private x:number = 0;
        private y:number = 0;
        
        goTo(_valx:number,_valy:number) {
            this.setX = _valx;
            this.setY = _valy;
        }

        get getX() { return this.x }
        set setX(_val:number) { this.x = Number(_val.toFixed(1)) }
    
        get getY() { return this.y }
        set setY(_val:number) { this.y = Number(_val.toFixed(1)) }
    
        get getWidth() { return getRender().getWidth }
        get getHeight() { return getRender().getHeight }
    }

    export namespace Sprites {

        export enum ScreenPlaces {randomPosition, center};

        namespace SpriteObjects {
            
            export class Costumes {
                private costumes:{ [id: string]: HTMLImageElement | null; } = {'NONE': null};

                private id = `NONE`;

                addCostume(id:string, image:HTMLImageElement | null) {
                    if (id.toUpperCase() === `NONE`)
                        throw new Error(`Cannot Set Costume None!`);
                    this.costumes[id] = image;
                }

                setCostumeById(id:string) { 
                    if (id.toUpperCase() === `NONE`)
                        this.id = `NONE`;
                    else
                        this.id = id;
                }

                getCostume = () => this.costumes[this.id];
            }

            export class Sounds {
                private sounds:{ [id: string]: HTMLAudioElement; } = {}

                addSound(id:string, src:string){
                    let audio = new Audio(src);
                    audio.preload = `auto`;
                    this.sounds[id] = audio;
                }

                stopSoundById(id:string) {
                    this.sounds[id].pause();
                    this.sounds[id].currentTime = 0;
                }
                
                pauseSoundById(id:string) { this.sounds[id].pause() }

                playSoundById(id:string) { this.sounds[id].play() }

                setSoundVolumeById(id:string, volume:number) { this.sounds[id].volume = volume / 100 }
            }

            export class Movement {
                private me:Sprite;

                private x:number = 0;
                private y:number = 0;

                constructor (me:Sprite) {
                    this.me = me;
                }

                goTo(_valx:number, _valy:number) {
                    this.x = _valx;
                    this.y = _valy;
                }
    
                to(place:ScreenPlaces) {
                    switch (place) {
                        case ScreenPlaces.center:
                            this.goTo( getRender().getWidth / 2 - this.me.getDimensions.getWidth / 2, getRender().getHeight / 2 - this.me.getDimensions.getHeight / 2);
                            break;
                        case ScreenPlaces.randomPosition:
                            this.goTo( Math.floor( Math.random() * getRender().getWidth ), Math.floor( Math.random() * getRender().getHeight ) );
                            break;
                    }
                }

                get getX() { return this.x }
                set setX(_val:number) {
                    this.x = _val; 
                    this.x = Number(this.x.toFixed(1));
                }
            
                get getY() { return this.y }
                set setY(_val:number) {
                    this.y = _val; 
                    this.y = Number(this.y.toFixed(1));
                }
            }

            export class Dimensions {
                private width:number = 0;
                private height:number = 0;

                get getWidth() { return this.width }
                set setWidth(_val:number) {
                    this.width = _val;
                    this.width = Number(this.width.toFixed(1));
                }
            
                get getHeight() { return this.height }
                set setHeight(_val:number) {
                    this.height=_val;
                    this.height=Number(this.height.toFixed(1));
                }
            }

            export class Effects{
                private hidden:boolean;
                private transparency:number;

                constructor(hidden:boolean, transparency:number){
                    this.hidden = hidden;
                    this.transparency = transparency;
                }

                clearEffects() {
                    this.hidden = false;
                    this.transparency = 0;
                }
            
                get getHidden() { return this.hidden }
                set setHidden(_val:boolean) { this.hidden = _val }
            
                get getTransparency() { return this.transparency }
                set setTransparency(_val:number) { this.transparency = _val }
            }

            export class Collision {
                private me:Sprite;

                constructor (me:Sprite) {
                    this.me = me;
                }

                touchingSprite = () => getGame().getSprites.filter(sprite => this.touching(sprite) && sprite !== this.me);
                
                touching(other:Sprite) {
                    if (this.me.getMovement.getX < other.getMovement.getX + other.getDimensions.getWidth &&
                    this.me.getMovement.getX + this.me.getDimensions.getWidth > other.getMovement.getX &&
                    this.me.getMovement.getY < other.getMovement.getY + other.getDimensions.getHeight &&
                    this.me.getMovement.getY + this.me.getDimensions.getHeight > other.getMovement.getY)
                        return true;
                    return false;
                }
            }

        }

        export class Sprite {
            private color:string;

            private id:string;

            private stageLevel:number;

            private movement = new SpriteObjects.Movement(this);

            private dimensions = new SpriteObjects.Dimensions();

            private costumes = new SpriteObjects.Costumes();

            private sounds = new SpriteObjects.Sounds();

            private effects = new SpriteObjects.Effects(false, 0);

            private collision = new SpriteObjects.Collision(this);

            constructor (id:string,x:number,y:number,width:number,height:number,color:string,stageLevel:number) {
                this.getMovement.setX = x;
                this.getMovement.setY = y;

                this.dimensions.setWidth = width;
                this.dimensions.setHeight = height;

                this.color = color;
                
                this.stageLevel = stageLevel;

                this.id = id;
            }

            isOnScreen() {
                if (this.movement.getX + this.dimensions.getWidth >= getGame().getCamera.getX && 
                this.movement.getX <= getGame().getCamera.getX + getRender().getWidth &&
                this.movement.getY + this.dimensions.getHeight >= getGame().getCamera.getY && 
                this.movement.getY <= getGame().getCamera.getY + getRender().getHeight) 
                    return true;
                return false;
            }
        
            get getColor() { return this.color }
            set setColor(_val:string) { this.color = _val }
            
            get getStageLevel() { return this.stageLevel }
            set setStageLevel(_val:number) { this.stageLevel=_val }

            get getId() { return this.id }

            get getMovement() { return this.movement }

            get getDimensions() { return this.dimensions }

            get getEffect() { return this.effects }

            get getCollision() { return this.collision }
        
            get getCostumes() { return this.costumes }

            get getSounds() { return this.sounds }
        }
    }

    const engine = new Engine();

    export const getEngine = () => engine;
    export declare let getLoader:() => Loader;
    export declare let getRender:() => RenderExtension;
    export declare let getGame:() => GameExtension;
    export declare let getController:() => Controller;
}