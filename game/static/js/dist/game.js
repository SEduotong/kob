class KobGameMenu {
    constructor(root) {
        this.root = root;
        this.$menu = $(`
<div class="kob-game-menu">
    <div class="kob-game-menu-field">
        <div class="kob-game-menu-field-item kob-game-menu-field-item-single-mode">单人模式</div>
        <div class="kob-game-menu-field-item kob-game-menu-field-item-multi-mode">多人模式</div>
        <div class="kob-game-menu-field-item kob-game-menu-field-item-settings">退出</div>
    </div>
</div>
`);
        this.$menu.hide();
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
            outer.root.settings.logout_on_remote();
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

class Particle extends KobGameObject {
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.eps = 1;
        this.friction = 0.9;

    }

    start() {

    }
    update() {
        if (this.move_length < this.eps || this.speed < this.eps) {
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        this.render();
    }
    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
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
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1; // 误差
        this.friction = 0.9; // 摩擦力
        this.spent_time = 0;
        this.cur_skill = null;

        if (this.is_me) {
            this.img = new Image();
            this.img.src = this.playground.root.settings.photo;
        }
    }

    start() {
        if (this.is_me) {
            this.add_listeneing_events();
        } else {
            let tx = this.playground.width * Math.random();
            let ty = this.playground.height * Math.random();
            this.move_to(tx, ty);
        }
    }

    add_listeneing_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function () {
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function (e) {
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3) {
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top);
            } else if (e.which === 1) {
                if (outer.cur_skill === "fireball") {
                    outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);
                }
                outer.cur_skill = null;
            }
        });

        $(window).keydown(function (e) {
            if (e.which === 81) { // q
                if (outer.radius < 10) return false;
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
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, this.playground.height * 0.01);
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

    is_attacked(angle, damage) {
        for (let i = 0; i < 10 + Math.random() * 10; i++) {
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle);
            let vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * Math.random() * 10;
            let move_length = this.radius * Math.random() * 15;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }
        this.radius -= damage;
        if (this.radius < 10) {
            this.destroy();
            return false;
        } else {
            this.damage_x = Math.cos(angle);
            this.damage_y = Math.sin(angle);
            this.damage_speed = damage * 100;
            this.speed *= 0.8;

        }
    }

    update() {
        this.spent_time += this.timedelta / 1000;
        if (!this.is_me && this.spent_time > 4 && Math.random() < 1 / 300.0) {
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;
            this.shoot_fireball(tx, ty);
        }
        if (this.damage_speed > 10) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        } else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (!this.is_me) {
                    let tx = this.playground.width * Math.random();
                    let ty = this.playground.height * Math.random();
                    this.move_to(tx, ty);
                }
            } else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
        this.render();
    }

    render() {
        if (this.is_me) {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
    }

    destroy() {
        this.on_destroy();
        super.destroy();
    }

    on_destroy() {
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
            }
        }
    }
}

class FireBall extends KobGameObject {
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage) {
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
        this.damage = damage;
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

        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player)) {
                this.attack(player);
            }
        }

        this.render();
    }

    get_dist(x1, y1, x2, y2) {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(player) {
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if (distance < this.radius + player.radius)
            return true;
        return false;
    }

    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);
        this.destroy();
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

        this.hide();

        this.start();
    }

    get_random_color() {
        let colors = ['green', 'blue', 'yellow', 'purple', 'orange', 'pink'];
        return colors[Math.floor(Math.random() * 6)];
    }

    start() {
    }

    show() {  // 显示游戏界面
        this.$playground.show();
        this.root.$kob_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);

        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, 'white', this.height * 0.15, true));

        for (let i = 0; i < 5; i++) {
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false));
        }
    }

    hide() {  // 隐藏游戏界面
        this.$playground.hide();
    }
}

class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "WEB";
        if (this.root.AppOS) this.platform = "APP";
        this.username = "";
        this.photo = "";
        this.$settings = $(`
<div class="kob-game-settings">
    <div class="kob-game-settings-login">
        <div class="kob-game-settings-title">
            <span class="kob-brand">KingOfBalls</span>
        </div>
        <div class="kob-game-settings-username">
            <div class="kob-game-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="kob-game-settings-password">
            <div class="kob-game-settings-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="kob-game-settings-submit">
            <div class="kob-game-settings-item">
                <button>登录</button>
            </div>
        </div>
        <div class="kob-game-settings-error-message"></div>
        <div class="kob-game-settings-options">注册</div>
        <div class="kob-game-settings-login-options">
            <span style="padding-top: 0.75vh;">更多登录方式：</span>
            <div class="kob-game-settings-qq">
                <img src="https://app4626.acapp.acwing.com.cn/static/image/settings/qq_login_logo.png" width="24px" alt="qq图标">
            </div>
        </div>
    </div>
    <div class="kob-game-settings-register">
        <div class="kob-game-settings-title">
            <span class="kob-brand">KingOfBalls</span>
        </div>
        <div class="kob-game-settings-username">
            <div class="kob-game-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="kob-game-settings-password">
            <div class="kob-game-settings-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="kob-game-settings-password-confirm">
            <div class="kob-game-settings-item">
                <input type="password" placeholder="请再次输入密码">
            </div>
        </div>
        <div class="kob-game-settings-submit">
            <div class="kob-game-settings-item">
                <button>注册</button>
            </div>
        </div>
        <div class="kob-game-settings-error-message"></div>
        <div class="kob-game-settings-options">登录</div>
    </div>
</div>
`);
        this.$login = this.$settings.find(".kob-game-settings-login");
        this.$login_username = this.$login.find(".kob-game-settings-username input");
        this.$login_password = this.$login.find(".kob-game-settings-password input");
        this.$login_submit = this.$login.find(".kob-game-settings-submit button");
        this.$login_error_message = this.$login.find(".kob-game-settings-error-message");
        this.$login_register = this.$login.find(".kob-game-settings-options");
        this.$login.hide();

        this.$register = this.$settings.find(".kob-game-settings-register");
        this.$register_username = this.$register.find(".kob-game-settings-username input");
        this.$register_password = this.$register.find(".kob-game-settings-password input");
        this.$register_password_confirm = this.$register.find(".kob-game-settings-password-confirm input");
        this.$register_submit = this.$register.find(".kob-game-settings-submit button");
        this.$register_error_message = this.$register.find(".kob-game-settings-error-message");
        this.$register_login = this.$register.find(".kob-game-settings-options");
        this.$register.hide();

        this.root.$kob_game.append(this.$settings);

        this.start();
    }

    start() {
        this.getinfo();
        this.add_listening_events();
    }

    add_listening_events() {
        this.add_listening_events_login();
        this.add_listening_events_register();
    }

    add_listening_events_login() {
        let outer = this;

        this.$login_register.click(function () {
            outer.register();
        });
        this.$login_submit.click(function () {
            outer.login_on_remote();
        });
    }

    add_listening_events_register() {
        let outer = this;

        this.$register_login.click(function () {
            outer.login();
        });
        this.$register_submit.click(function () {
            outer.register_on_remote();
        });
    }

    login_on_remote() {  // 在远程服务器上登录
        let outer = this;

        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_message.empty();
        $.ajax({
            url: "https://app4626.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    location.reload();
                } else {
                    outer.$login_error_message.html(resp.result);
                }
            }
        })
    }

    register_on_remote() { // 在远程服务器上注册
        let outer = this;

        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        $.ajax({
            url: "https://app4626.acapp.acwing.com.cn/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    location.reload();
                } else {
                    outer.$register_error_message.html(resp.result);
                }
            }
        })
    }

    logout_on_remote() {  // 在远程服务器上登出
        if (this.platform === "APP") return false;

        $.ajax({
            url: "https://app4626.acapp.acwing.com.cn/settings/logout/",
            type: "GET",
            success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    location.reload();
                }
            }
        })
    }

    login() {
        this.$register.hide();
        this.$login.show();
    }

    register() {
        this.$login.hide();
        this.$register.show();
    }

    getinfo() {
        let outer = this;
        $.ajax({
            url: "https://app4626.acapp.acwing.com.cn/settings/getinfo/", type: "GET", data: {
                platform: outer.platform,
            }, success: function (resp) {
                console.log(resp);
                if (resp.result === "success") {
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show()
                } else {
                    outer.login();
                }
            }
        });
    }

    hide() {
        this.$settings.hide();
    }

    show() {
        this.$settings.show();
    }
}
export class KobGame {
    constructor(id, AppOS) {
        this.id = id;
        this.$kob_game = $('#' + id);
        this.AppOS = AppOS;
        this.settings = new Settings(this);
        this.menu = new KobGameMenu(this);
        this.playground = new KobGamePlayground(this);

        this.start();
    }

    start() {
    }
}

