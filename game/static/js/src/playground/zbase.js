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
