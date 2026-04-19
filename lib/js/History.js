import State from './State.js';

/**
 * Manage modal history
 */

export default class History {
    constructor(fragment = '!') {
        this.fragment = fragment;
        this.path = location.pathname.replace(/^\/*(.*)\/*$/, "$1") + location.search;

        this.states = [];

        this.add(new State(this.path));
    }

    getHashFragment() {
        return '#' + this.fragment;
    }

    change(state, replace = false) {
        let fullPath = '/' + state.path;

        if (state.hashbang) {
            fullPath += '#' + this.fragment + state.hashbang;
        }

        if (true === replace) {
            history.replaceState(state, '', fullPath);
        }
        else {
            history.pushState(state, '', fullPath);
        }

        document.title = state.title;
        return this;
    }

    add(state) {
        this.states.push(state);
        this.change(state, false);
        return this;
    }

    replace(state) {
        this.states.push(state);
        this.change(state, true);
        return this;
    }

    back() {
        if (this.states.length > 1) {
            // remove current state
            this.states.pop();
            // go back to previous state
            this.change(this.states[this.states.length - 1], true);
            return this;
        }

        // if no history, just go to the homepage
        window.location.href = '/';
    }
};
