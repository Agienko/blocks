import {Container, Point, Rectangle, Sprite, Texture} from "pixi.js";
import {randomFromArr} from "../../../helpers/helper.js";
import {gsap} from "gsap";
import {sender} from "../../../sender/event-sender.js";
import {BLOCK_SIZE} from "../../../config/constants.js";
import {figures} from "../../../config/figures.js";

const ACCELERATION_X = 1.2;
const ACCELERATION_Y = 1.5;

let textures = null;
const getTextures = () => {
    if (textures) return textures;
    textures = [
        'red',
        'blue',
        'green',
        'yellow',
        'cyan',
        'orange',
        'purple'
    ].map(color => Texture.from(color));
    return textures;
}

export class Figure extends Container{
    constructor(stage) {
        super();
        this.stage = stage;
        stage.addChild(this);

        this.canInstall = true;

        this.tween = null;
        this.scheme = randomFromArr(figures)
        this.#createBlocks();
        this.pivot.y = 100;
        this.shouldDestroy = false;
        this.startCoords = {x: 0, y: 0};

        this.dragOffset = {x: 0, y: 0};
        this.pressFlag = false;

        this.eventMode = 'static';
        this.cursor = 'pointer';

        this.hitArea = new Rectangle(this.width - 100, this.height - 100, 200, 200);

        this.on('pointerdown', this.onPointerDown);
        window.addEventListener('pointermove', this.onPointerMove);
        window.addEventListener('pointerup', this.onPointerUp);

    }

    onPointerDown = e => {
        this.pressFlag = true;
        this.startCoords = {x: this.x, y: this.y};
        this.stage.addChild(this);

        const local = this.parent.toLocal(e.global);
        this.dragOffset = {x: local.x * ACCELERATION_X - this.x, y: local.y * ACCELERATION_Y - this.y};

        this.tween?.kill();
        this.tween = gsap.to(this, {y: this.dragOffset.y, pixi: {scale: 1}, duration: 0.1,
            onUpdate: () => {
                const local = this.parent.toLocal(e.global);
                this.dragOffset = {x: local.x * ACCELERATION_X - this.x, y: local.y * ACCELERATION_Y - this.y};
            },
            onComplete: () => {
                const local = this.parent.toLocal(e.global);
                this.dragOffset = {x: local.x * ACCELERATION_X - this.x, y: local.y * ACCELERATION_Y - this.y};
                }
            });
    }

    onPointerMove = e => {
        if(!this.pressFlag) return;

        const global = new Point(e.x, e.y);

        const local = this.parent.toLocal(global);

        this.x = local.x * ACCELERATION_X - this.dragOffset.x;
        this.y = local.y * ACCELERATION_Y - this.dragOffset.y;

        sender.send('move', this);

    }
    onPointerUp = e => {
        if(!this.pressFlag) return;
        this.eventMode = 'none';
        this.pressFlag = false;

        this.tween?.kill();

        if(this.shouldDestroy){
            this.children.forEach(child => {
                gsap.to(child, {x: child.toPos.x, y: child.toPos.y, duration: 0.1, onComplete: () => {
                        sender.send('lock', {...child.toIJ, isLast: this.children.length === 1});
                        child.toPos = null;
                        child.toIJ = null;
                        this.removeChild(child);
                        if(this.children.length === 0) {
                            this.destroy({ children: true});
                            sender.send('figureDestroy');
                        };
                    }});
            })
        } else {
            sender.send('back');
            this.tween = gsap.to(this, {x: this.startCoords.x, y: this.startCoords.y, pixi: {scale: 0.5}, duration: 0.1, onComplete: () => {
                    this.eventMode = 'static';
                }});
        }

    }
    setCanInstall(canInstall) {
        this.canInstall = canInstall;
        this.eventMode = canInstall ? 'static' : 'none';
        this.alpha = canInstall ? 1 : 0.5;
    }


    #createBlocks(){
        const texture = randomFromArr(getTextures());

        this.scheme.forEach(cell => {
            const block = new Sprite({
                texture,
                x: cell[0] * BLOCK_SIZE,
                y: cell[1] * BLOCK_SIZE,
            })
            this.addChild(block);
            this.scale.set(0.5)
        })
    }

    destroy(options) {
        this.tween?.kill();
        this.tween = null;
        this.scheme = null;
        this.stage = null;
        this.off('pointerdown', this.onPointerDown);
        window.removeEventListener('pointermove', this.onPointerMove);
        window.removeEventListener('pointerup', this.onPointerUp);
        super.destroy(options);
    }
}