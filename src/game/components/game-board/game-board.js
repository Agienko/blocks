import {Container, Sprite, Texture} from "pixi.js";
import {sender} from "../../../sender/event-sender.js";
import {SIGNALS} from "../../../signals/signals.js";
import {BLOCK_SIZE, BOARD_SIZE} from "../../../config/constants.js";
import gsap from "gsap";
import {sound} from "@pixi/sound";

const HALF_BLOCK_SIZE = BLOCK_SIZE / 2;

export class GameBoard extends Container{
    constructor(stage) {
        super();
        stage.addChild(this);
        this.bg = new Sprite({
            texture: Texture.from('board'),
            width: BOARD_SIZE,
            height: BOARD_SIZE
        })
        this.addChild(this.bg);


        this.blocks = [];
        this.highlights = [];

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const block = new Sprite({
                    texture: Texture.from('gray'),
                    alpha: 0,
                    x: 6 + j * BLOCK_SIZE,
                    y: 6 + i * BLOCK_SIZE
                })
                block.i = i;
                block.j = j;
                block.b = Math.floor(block.i / 3) * 3 + Math.floor(block.j / 3);
                block.isLocked = false;
                this.blocks.push(block);


                const highlight = new Sprite({
                    texture: Texture.from('allowed'),

                    alpha: 0,
                    x: 6 + j * BLOCK_SIZE - 18,
                    y: 6 + i * BLOCK_SIZE - 15,
                    blendMode: 'add'
                })

                highlight.i = i;
                highlight.j = j;
                highlight.b = block.b;

                this.highlights.push(highlight)
                this.addChild(highlight);
                this.addChild(block);

            }
        }

        sender.on('lock', this.onLock);
        sender.on('back', this.onBack);
        sender.on('move', this.onMove);
        sender.on('figureDestroy', this.onFigureDestroy);

    }

    canInstall(scheme){
        const freeBlocks = this.blocks.filter(block => !block.isLocked);

        return freeBlocks.some(block => {
            for (let k = 0; k < scheme.length; k++) {
                const [j, i] = scheme[k];
                const blockInScheme = freeBlocks.find(b => b.i === block.i + i && b.j === block.j + j);
                if(!blockInScheme) return false;
            }
            return true;

        })
    }

    onLock = ({i, j, isLast}) => {
        const block = this.blocks.find(block => block.i === i && block.j === j);
        block.isLocked = true;
        block.alpha = 1;
        SIGNALS.score.value++;
        if(isLast) {
            sound.play('put', {volume: 0.1, end: 0.14});
            this.checkCombinations();
        }
    }

    onBack = () => {
        this.blocks.forEach(block => {
            if(block.isLocked) return;
            block.alpha = 0;
        });
        sound.play('back', {volume: 0.2});
    }

    onMove = figure => {
        const freeBlocks = this.blocks.filter(block => {
            if(!block.isLocked) block.alpha = 0;
            return !block.isLocked
        });

        const blocksToPush = new Set();
        figure.children.forEach(child => {
            const bounds = this.parent.toLocal(child.position, figure);
            const j = Math.floor((bounds.x + HALF_BLOCK_SIZE - this.x - 6) / BLOCK_SIZE);
            const i = Math.floor((bounds.y + HALF_BLOCK_SIZE - this.y - 6) / BLOCK_SIZE);

            freeBlocks.forEach(block => {
                if(block.j === j && block.i === i) {
                    blocksToPush.add(block);
                    block.texture = child.texture;
                    child.toPos = figure.toLocal(block.position, this);
                    child.toIJ = {i, j};
                }
            });
        })

        figure.shouldDestroy = blocksToPush.size === figure.children.length;

        if(figure.shouldDestroy) {
            blocksToPush.forEach(block => block.alpha = 0.5);
            const result = this.checkCombinations(true);

            if(result.hasWin) {
                this.highlights.forEach(highlight => {
                    if(result.i.includes(highlight.i) || result.j.includes(highlight.j) || result.b.includes(highlight.b)) {
                        highlight.alpha = 0.5;
                    } else {
                        highlight.alpha = 0;
                    }
                })
            } else {
                this.highlights.forEach(highlight => highlight.alpha = 0)
            }

        } else {
            this.highlights.forEach(highlight => highlight.alpha = 0)
        }
    }

    onFigureDestroy = () => {
        const result = this.checkCombinations(false);
        this.clean(result)
    }

    checkCombinations(isTest = false){

        const lockedI = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0};
        const lockedJ = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0};
        const lockedB = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0};

        this.blocks.forEach(block => {
            if(isTest ? block.alpha === 0.5 || block.isLocked : block.isLocked) {
                lockedI[block.i]++;
                lockedJ[block.j]++;
                lockedB[block.b]++;
            }
        })
        const winI = [];
        const winJ = [];
        const winB = [];

        for(const key in lockedI){
            if(lockedI[key] === 9) winI.push(+key);
            if(lockedJ[key] === 9) winJ.push(+key);
            if(lockedB[key] === 9) winB.push(+key);
        }

        const combo = winI.length + winJ.length + winB.length;
        return ({i: winI, j: winJ, b: winB, hasWin: !!combo, combo});
    }

    clean(data){
        if(!data.hasWin) return;

        sound.play('win', {volume: 0.2, speed: 2});

        const toClean = this.blocks.filter(block => {
            return data.i.includes(block.i) || data.j.includes(block.j) || data.b.includes(block.b)
        })

        toClean.forEach((block, i) => {
            gsap.to(block, {alpha: 0, delay: i*0.014, duration: 0.2, onComplete: () => {
                    block.isLocked = false;

                    if(i === toClean.length - 1) {
                        sound.stop('win')
                    }
            }});
        });

        this.highlights.forEach(highlight => highlight.alpha = 0);
        SIGNALS.score.value += data.combo * (data.i.length + data.j.length + data.b.length) * 9;
    }

    destroy(options) {
        sender.off('lock', this.onLock);
        sender.off('back', this.onBack);
        sender.off('move', this.onMove);
        sender.off('figureDestroy', this.onFigureDestroy);

        this.blocks = null;
        this.highlights = null;
        super.destroy(options);
    }

}