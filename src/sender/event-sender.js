class Sender {
    #eventMap;
    constructor() {
        this.#eventMap = new Map();
    }
    send(event, payload){
        if(!this.#eventMap.has(event)) return;
        this.#eventMap.get(event).forEach(callback => callback(payload))
    }
    on(event, callback){
        if(!this.#eventMap.has(event)) this.#eventMap.set(event, new Set());
        if(callback instanceof Function) this.#eventMap.get(event).add(callback)
    }
    off(event, callback){
        if(!this.#eventMap.has(event)) return
        this.#eventMap.get(event).delete(callback)
    }

}
export const sender = new Sender()
