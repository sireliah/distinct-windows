/*jshint esversion: 6 */
'use strict';

let on_window_created;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Workspace = imports.ui.workspace;
const St = imports.gi.St;

// TODO: garbage collect this
let windows = {};
let number = 0;

// TODO:
// scale factor


function generateRandomColor() {
    return Math.floor((Math.random() * 255) + 1);
}

function generateRGBA() {
    return `rgba(${generateRandomColor()}, ${generateRandomColor()}, ${generateRandomColor()}, 0.7)`;
}

class DistinctOverlay extends Workspace.WindowOverlay {
    constructor(windowClone, parentActor) {
        super(windowClone, parentActor);
        const meta = this._windowClone.metaWindow;
        const windowName = this._windowClone.metaWindow.toString();
        // log(`This: ${this._windowClone.metaWindow.get_parent()}`);

        let currentWindow = global.get_window_actors().filter(actor => {
            log(meta === actor.meta_window);
            return meta === actor.meta_window;
        }).pop();

        log(currentWindow);
        if (currentWindow) {
            log(currentWindow.get_meta_window());
            currentWindow.connect('destroy', () => {
                log('Deleting stuff');
                delete windows[windowName];
            });
        }        

        if (windowName in windows) {
            const {uniqueName, color} = windows[windowName];
        } else {
            number += 1;
            windows[windowName] = {uniqueName: number, color: generateRGBA()};
        }

        this._marker = {number};
        this._marker.box = new St.Bin();
        const {uniqueName, color} = windows[windowName];
        this._marker.box.style = `background-color: ${color};
                                  border-radius: 6px;`;
        this._marker.box.height = 50;
        this._marker.box.width = 50;


        this._marker.label = new St.Label({style_class: 'extension-distinctWindows-label', text: `${uniqueName}`});
        this._marker.box.add_actor(this._marker.label);
        
        parentActor.add_actor(this._marker.box);
        parentActor.set_child_below_sibling(this.title, this._marker.box);
    }

    show() {
        super.show(...arguments);
        if (this._marker && this._marker.box) {
            this._marker.box.show();
        }
    }

    hide() {
        super.hide(...arguments);

        if (this._marker && this._marker.box) {
            this._marker.box.hide();
        }
    }

    relayout(animate) {
        super.relayout(animate);

        if (this._marker && this._marker.box) {
            let [x, y, width, height] = this._windowClone.slot;
            this._marker.box.set_position(x, y);
        }
    }

    // _onDestroy(animate) {
    //     super._onDestroy(animate);
    //     log(`Destroying: ${this.actor}`);
    //     const windowName = this._windowClone.get_label_actor().text;

    //     if (this._marker && this._marker.box) {
    //         log(`Cleaning: ${windowName}`);
    //         delete windows[windowName];
    //     }
    // }
}


class Extension {
    constructor() {
        this._originalOverlay = Workspace.WindowOverlay;
    }

    enable() {
        Workspace.WindowOverlay = DistinctOverlay;
    }

    disable() {
        Workspace.WindowOverlay = this._originalOverlay;
    }
}

function init() {
    log("Initialized!");
    return new Extension();
}