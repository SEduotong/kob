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

