import {Container} from "pixi.js";
import {ScoreBoard} from "./components/score-board/score-board.js";
import {GameBoard} from "./components/game-board/game-board.js";
import {FigureBoard} from "./components/figure-board/figure-board.js";
import {SIGNALS} from "../signals/signals.js";
import {sender} from "../sender/event-sender.js";
import {BOARD_SIZE} from "../config/constants.js";
import {GameOver} from "./components/game-over.js";

export class Game extends Container{
    constructor(stage) {
        super();
        stage.addChild(this);

        this.scoreBoard = new ScoreBoard(this);
        this.scoreBoard.x = BOARD_SIZE/2
        this.gameBoard = new GameBoard(this);
        this.gameBoard.y = 80
        this.createBoard = new FigureBoard(this, this.gameBoard.canInstall.bind(this.gameBoard));
        this.createBoard.y = 480

        sender.on('resize', this.onResize);
        this.onResize(SIGNALS.scale.value);

        sender.on('gameOver', this.onGmeOver);

    }
    onGmeOver = () => {
        new GameOver(this)
    }
    onResize = (scale) => {
        this.scale.set(scale);
        this.x = (innerWidth - BOARD_SIZE * scale)/2;
    }

    destroy(options) {
        sender.off('resize', this.onResize);
        sender.off('gameOver', this.onGmeOver);
        this.scoreBoard.destroy({children: true});
        this.gameBoard.destroy({children: false});
        this.createBoard.destroy({children: false});
        this.scoreBoard = null;
        this.gameBoard = null;
        this.createBoard = null;
        super.destroy(options);
    }

}
