import {SIGNALS} from "../signals/signals.js";
import {app} from "../main.js";
import {sender} from "../sender/event-sender.js";

const MIN_WIDTH = 380;
const MIN_HEIGHT = 640;
const RATIO = MIN_WIDTH/MIN_HEIGHT;

export class Resizer {
    constructor() {
        this.viewPort = window.visualViewport ?? window;
        this.viewPort.addEventListener('resize', this.onResize);
        this.onResize();

        this.initFullScreen();

    }
    onResize = () => {
        app.renderer.resize(innerWidth, innerHeight);

        if(innerWidth/innerHeight < RATIO) {
            SIGNALS.scale.value = innerWidth/MIN_WIDTH;
        } else {
            SIGNALS.scale.value = innerHeight/MIN_HEIGHT;
        }
        sender.send('resize', SIGNALS.scale.value)
    }

    checkInIframe(){
        try {
            return window.self !== window.top;
        } catch {
            return true;
        }
    }

    checkHasFullscreenApi(){
        return !document.fullscreenEnabled || document?.documentElement?.requestFullscreen;
    }

    initFullScreen(){
        if(!this.checkHasFullscreenApi() || this.checkInIframe()) return;

        document.addEventListener('touchend', async function onFullscreen(e) {
            try {
                await document.documentElement.requestFullscreen();
            } finally {
                document.removeEventListener('touchstart', onFullscreen);
            }
        }, {passive: true, once: true})
    }
}