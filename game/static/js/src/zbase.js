class KobGame {
    constructor(id) {
        this.id = id;
        this.$kob_game = $('#' + id);
        this.menu = new KobGameMenu(this);
        this.playground = new KobGamePlayground(this);

        this.start();
    }

    start() {
    }
}
