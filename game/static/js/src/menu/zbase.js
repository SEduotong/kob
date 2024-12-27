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
