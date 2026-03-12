import {Container, Sprite, Text, Texture} from "pixi.js";
import {sender} from "../../sender/event-sender.js";
import {BOARD_SIZE} from "../../config/constants.js";
import {SIGNALS} from "../../signals/signals.js";
import gsap from "gsap";

export class GameOver extends Container{
    constructor(stage) {
        super();
        this.stage = stage;
        stage.addChild(this);
        this.overlay = new Sprite({
            texture: Texture.WHITE,
            width: innerWidth,
            height: innerHeight,
            alpha: 0.5,
            tint: 0x000000,
            eventMode: 'static'
        });
        this.addChild(this.overlay);
        this.gameOverText = new Text({
            text: 'Game Over!',
            anchor: {x: 0.5, y: 0.5},
            style: {
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontSize: 48,
                fill: '#ffffff',
                dropShadow: true,
                dropShadowColor: '#000000',
                dropShadowAlpha: 0.25,
                dropShadowBlur: 4,
                dropShadowAngle: Math.PI / 2,
                dropShadowDistance: 4,
                wordWrap: true,
                wordWrapWidth: 400,
                align: 'center'
            }
        })
        this.addChild(this.gameOverText);

        this.text = new Text({
            text: 'Tap anywhere to continue!',
            anchor: {x: 0.5, y: 0.5},
            y: 40,
            style: {
                fontFamily: 'Arial',
                fontSize: 12,
                fill: '#d4d4d4',
                dropShadow: true,
                dropShadowColor: '#000000',
                dropShadowAlpha: 0.25,
                dropShadowBlur: 4,
                dropShadowAngle: Math.PI / 2,
                dropShadowDistance: 4,
                wordWrap: true,
                wordWrapWidth: 400,
                align: 'center'
            }
        })
        this.addChild(this.text);

        this.tween = gsap.to(this.text, {alpha: 0.5, duration: 0.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });


        sender.on('resize', this.onResize);
        this.onResize(SIGNALS.scale.value);
        this.eventMode = 'static';
        this.on('pointerup', () => {
            this.gameOverText.visible = false;
            this.text.visible = false;
            gsap.to(this.overlay, {alpha: 1, duration: 0.1, onComplete: () => {
                    sender.send('restart');
                }})
        })
    }
    onResize = (scale) => {
        this.overlay.width = innerWidth/scale;
        this.overlay.height = innerHeight/scale;
        const point = this.stage.toLocal({x: 0, y: 0}, null, {x: 0, y: 0});
        this.overlay.x = point.x;
        this.overlay.y = point.y;
        this.gameOverText.x = this.text.x = BOARD_SIZE/2;
        this.gameOverText.y = BOARD_SIZE/2;
        this.text.y = BOARD_SIZE/2 + 40;
    }
    destroy(options) {
        this.overlay.destroy({children: true});
        this.overlay = null;
        this.gameOverText.destroy({children: true});
        this.gameOverText = null;
        sender.off('resize', this.onResize);
        super.destroy(options);
    }
}