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
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

}
class Player extends KobGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1; // 误差

        this.cur_skill = null;
    }

    start() {
        if (this.is_me) {
            this.add_listeneing_events();
        }
    }

    add_listeneing_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function (e) {
            if (e.which === 3) {
                outer.move_to(e.clientX, e.clientY);
            } else if (e.which === 1) {
                if (outer.cur_skill === "fireball") {
                    outer.shoot_fireball(e.clientX, e.clientY);
                    outer.cur_skill = null;
                }
            }
        });

        $(window).keydown(function (e) {
            if (e.which === 81) { // q
                outer.cur_skill = "fireball";
                return false;
            }
        });
    }

    shoot_fireball(tx, ty) {
        let x = this.x;
        let y = this.y;
        let radius = this.playground.height * 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        let color = "red";
        let speed = this.playground.height * 0.5;
        let move_length = this.playground.height * 1.0;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length);
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);

    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    update() {
        if (this.move_length < this.eps) {
            this.move_length = 0;
            this.vx = this.vy = 0;
        } else {
            let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
            this.x += this.vx * moved;
            this.y += this.vy * moved;
            this.move_length -= moved;
        }
        this.render();
    }

}
class FireBall extends KobGameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.player = player;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.eps = 0.1; // 误差
    }

    start() {
    }

    update() {
        if (this.move_length < this.eps) {
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        this.render();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
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

        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, 'white', this.height * 0.15, true));

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
