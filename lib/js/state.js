export default class State {
    constructor(url, hashbang, title) {
        this.url = url;
        this.hashbang = hashbang || '';
        this.title = title || document.title;
    }
}
