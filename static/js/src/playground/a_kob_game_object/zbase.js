let KOB_GAME_OBJECTS = [];

class KobGameObject {
    constructor() {
        KOB_GAME_OBJECTS.push(this);

        this.has_called_start = false; // 是否已经调用过start
        this.timedelta = 0; // 两帧之间的时间间隔
        this.uuid = this.crete_uuid();
    }

    crete_uuid() {
        let res = "";

        for (let i = 0; i < 8; i ++ ) {
            let x = parseInt(Math.floor(Math.random() * 10));  //  返回[0, 1) * 10
            res += x;
        }
        return res
    }


    start() { // 只在第一帧执行一次

    }

    update() { // 每帧执行一次

    }

    ondestroy() { // 被销毁前执行一次

    }

    destroy() { // 销毁对象
        this.ondestroy();

        for (let i = 0; i < KOB_GAME_OBJECTS.length; i++) {
            if (KOB_GAME_OBJECTS[i] === this) {
                KOB_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }


}

let last_timestamp;
let KOB_GAME_ANIMATION = function (timestamp) {
    for (let i = 0; i < KOB_GAME_OBJECTS.length; i++) {
        let obj = KOB_GAME_OBJECTS[i];
        if (!obj.has_called_start) {
            obj.start();
            obj.has_called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }

    last_timestamp = timestamp;

    requestAnimationFrame(KOB_GAME_ANIMATION);
}

requestAnimationFrame(KOB_GAME_ANIMATION);


