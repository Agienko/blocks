import './style.css';
import {gsap} from "gsap";
import {PixiPlugin} from "gsap/PixiPlugin";
import * as PIXI from 'pixi.js';
import {Application, Assets} from "pixi.js";
import {Game} from "./game/game.js";
import {manifest} from "./config/manifest.js";
import {Resizer} from "./resizer/resizer.js";
import {SoundFix} from "./sound-fix/sound-fix.js";
import {sender} from "./sender/event-sender.js";
import {SIGNALS} from "./signals/signals.js";


gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

export const app = new Application();
let game = null;


(async () => {
    await app.init({
        resolution: devicePixelRatio,
        autoDensity: true,
        antialias: false,
        preference: 'webgpu',
        backgroundColor: '#0A0A45',
    });
    document.body.append(app.canvas);

    await Assets.init({manifest});
    await Assets.loadBundle(['sounds', 'textures']);
    new Resizer();
    new SoundFix();
    sender.send('restart')
})();




sender.on('restart', () => {
    game?.destroy({children: true});
    SIGNALS.score.value = 0;
    game = new Game(app.stage);
});

