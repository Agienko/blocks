import {Container, Sprite, Text, Texture} from "pixi.js";
import {effect} from "@preact/signals-core";
import {SIGNALS} from "../../../signals/signals.js";

export class ScoreBoard extends Container{
    constructor(stage) {
        super();
        stage.addChild(this);
        this.bg = new Sprite({
            texture: Texture.from('score')
        });
        this.icon = new Sprite({
            texture: Texture.from('icon'),
            x: 30,
            y: 13
        })

        this.text = new Text({
            text: 'Score: 0',
            style: {
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fontSize: 24,
                fill: '#a5a5d6',
                dropShadow: true,
                dropShadowColor: '#000000',
                dropShadowAlpha: 0.25,
                dropShadowBlur: 4,
                dropShadowAngle: Math.PI / 2,
                dropShadowDistance: 4
            },
            anchor: {x: 0, y: 0.5},
            x: 80,
            y: 32
        })

        this.addChild(this.bg, this.icon, this.text);

        this.pivot.x = this.bg.width/2;
        SIGNALS.score.value = 0;
        this.stop = effect(() => {
            this.#setText(SIGNALS.score.value);
        })
    }

    #setText(text){
        this.text.text = `Score: ${text}`;

        if(text.toString().length >= 8) {
            this.text.style.fontSize = 18;
        } else {
            this.text.style.fontSize = 24;
        }

    }
    destroy(options) {
        this.stop();
        this.stop = null;
        super.destroy(options);
    }
}