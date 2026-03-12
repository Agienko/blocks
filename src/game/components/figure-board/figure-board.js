import {Container} from "pixi.js";
import {Figure} from "./figure.js";
import {sender} from "../../../sender/event-sender.js";

export class FigureBoard extends Container{
    constructor(stage, canInstall) {
        super();
        this.stage = stage;
        this.canInstall = canInstall;
        stage.addChild(this);
        this.x = 20;

        this.createFigures();

        sender.on('figureDestroy', this.onFigureDestroy);

    };

    onFigureDestroy = () => {
        if (!this.children.length) this.createFigures();

        this.children.forEach(figure => {
            const canInstall = this.canInstall(figure.scheme);
            figure.setCanInstall(canInstall);
        })

        if(this.children.every(figure => !figure.canInstall)){
            sender.send('gameOver');
        }
    }

    createFigures(){
        const figure1 = new Figure(this, this.stage);
        const figure2 = new Figure(this, this.stage);
        const figure3 = new Figure(this, this.stage);

        const totalWidth = figure1.width + figure2.width + figure3.width;
        const gap = (330 - totalWidth) / 2;

        figure1.y = 100 - figure1.height/2;
        figure2.y = 100 - figure2.height/2;
        figure3.y = 100 - figure3.height/2;

        figure1.x = 0;
        figure2.x = figure1.x + figure1.width + gap;
        figure3.x = figure2.x + figure2.width + gap;

        this.addChild(figure1, figure2, figure3);
    }
    destroy(options) {
        sender.off('figureDestroy', this.onFigureDestroy);
        this.stage = null;
        this.canInstall = null;
        super.destroy(options);
    }
}