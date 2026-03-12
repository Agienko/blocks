import {sound} from "@pixi/sound";

export class SoundFix {
    constructor() {
        sound.disableAutoPause = true;
        this.inProcess = false;
        document.addEventListener('visibilitychange', () => {
            document.visibilityState === 'visible' ?sound.unmuteAll() : sound.muteAll();
            this.restoreAudio()
        });
        window.addEventListener('pageshow', e => e.persisted && this.restoreAudio());

    }

    async restoreAudio() {
        if (this.inProcess || document.visibilityState !== 'visible') return;
        this.inProcess = true;
        try {
            await this.wait(250);
            sound.context.audioContext.suspend();
            await this.wait(250);
            sound.context.audioContext.resume();
            await this.wait(250);
            this.inProcess = false;
        } catch {
            this.inProcess = false;
            void this.restoreAudio();
        }
    }

    wait(ms){
        return new Promise(resolve => setTimeout(resolve, ms))
    }

}