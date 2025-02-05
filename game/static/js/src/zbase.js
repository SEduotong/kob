export class KobGame {
    constructor(id, AppOS, access, refresh) {
        this.id = id;
        this.$kob_game = $('#' + id);
        this.AppOS = AppOS;
        this.access = access;
        this.refresh = refresh;
        this.settings = new Settings(this);
        this.menu = new KobGameMenu(this);
        this.playground = new KobGamePlayground(this);

        this.start();
    }

    start() {
    }
}
