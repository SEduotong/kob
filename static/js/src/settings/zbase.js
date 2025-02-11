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
        this.$qq_login = this.$login.find(".kob-game-settings-qq");
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
        if (this.root.access) {
            this.getinfo();
            this.refresh_jwt_token();
        } else {
            this.login();
        }
        this.add_listening_events();
    }

    refresh_jwt_token() {
        setInterval(() => {
            $.ajax({
                url: "https://app4626.acapp.acwing.com.cn/settings/token/refresh/",
                type: "POST",
                data: {
                    refresh: this.root.refresh,
                },
                success: resp => {
                    this.root.access = resp.access;
                    console.log(resp);
                }
            });
        }, 4.5 * 60 * 1000);

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
        this.$qq_login.click(function () {
            outer.qq_login();
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

    qq_login() {
        let url = window.location.href;
        $.ajax({
            url: url + "settings/qq/apply_code/",
            type: "GET",
            success: function (resp) {
                if (resp.result === "success") {
                    window.location.replace(resp.apply_code_url);
                }
            }
        });
    }

    login_on_remote(username, password) {  // 在远程服务器上登录
        username = username || this.$login_username.val();
        password = password || this.$login_password.val();
        this.$login_error_message.empty();
        $.ajax({
            url: "https://app4626.acapp.acwing.com.cn/settings/token/",
            type: "POST",
            data: {
                username,
                password,
            },
            success: resp => {
                console.log(resp);
                this.root.access = resp.access;
                this.root.refresh = resp.refresh;
                this.refresh_jwt_token();
                this.getinfo();
            },
            error: () => {
                this.$login_error_message.html("用户名或密码错误");
            }
        })
    }

    register_on_remote() { // 在远程服务器上注册\
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        $.ajax({
            url: "https://app4626.acapp.acwing.com.cn/settings/register/",
            type: "POST",
            data: {
                username: username,
                password,
                password_confirm,
            },
            success: resp => {
                if (resp.result === "success") {
                    this.login_on_remote(username, password);
                } else {
                    this.$register_error_message.html(resp.result);
                }
            }
        })
    }

    logout_on_remote() {  // 在远程服务器上登出
        if (this.platform === "APP") return false;

        this.root.access = "";
        this.root.refresh = "";
        location.href= "/";
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
        $.ajax({
            url: "https://app4626.acapp.acwing.com.cn/settings/getinfo/",
            type: "GET",
            data: {
                platform: this.platform,
            },
            headers: {
                'Authorization': "Bearer " + this.root.access,
            },
            success: resp => {
                if (resp.result === "success") {
                    console.log(resp);
                    this.username = resp.username;
                    this.photo = resp.photo;
                    this.hide();
                    this.root.menu.show()
                } else {
                    this.login();
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
