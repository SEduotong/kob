class KobGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="kob-game-menu">
    <div class="kob-game-menu-field">
        <div class="kob-game-menu-field-item kob-game-menu-field-item-single-mode">单人模式</div>
        <div class="kob-game-menu-field-item kob-game-menu-field-item-multi-mode">多人模式</div>
        <div class="kob-game-menu-field-item kob-game-menu-field-item-settings">设置</div>
    </div>
</div>
`);
        this.root.$kob_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.kob-game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.kob-game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.kob-game-menu-field-item-settings');

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;
        this.$single_mode.click(function () {
            outer.hide();
            outer.root.playground.show();
        });
        this.$multi_mode.click(function () {
            console.log('multi');
        });
        this.$settings.click(function () {
            console.log('settings');
        });
    }

    show() {
        this.$menu.show();
    }

    hide() {
        this.$menu.hide();
    }
}
let KOB_GAME_OBJECTS = [];

class KobGameObject {
    constructor() {
        KOB_GAME_OBJECTS.push(this);

        this.has_called_start = false; // 是否已经调用过start
        this.timedelta = 0; // 两帧之间的时间间隔
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
class GameMap extends KobGameObject {
    constructor(playground) {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.playground.$playground.append(this.$canvas);
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
    }

    start() {

    }

    update() {
        this.render();
    }

    render() {
        this.fillStyle = "rgba(0, 0, 0, 0.6)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
class KobGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="kob-game-playground"></div>`);

        // this.hide();
        this.root.$kob_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);

        this.start();
    }

    start() {
    }

    show() {  // 显示游戏界面
        this.$playground.show();
    }

    hide() {  // 隐藏游戏界面
        this.$playground.hide();
    }
}
export class KobGame {
    constructor(id) {
        this.id = id;
        this.$kob_game = $('#' + id);
        // this.menu = new KobGameMenu(this);
        this.playground = new KobGamePlayground(this);

        this.start();
    }

    start() {
    }
}
