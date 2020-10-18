/*jshint esversion: 6 */
'use strict';

let on_window_created;

const ExtensionUtils = imports.misc.extensionUtils;
const Gio = imports.gi.Gio;
const Me = ExtensionUtils.getCurrentExtension();
const Workspace = imports.ui.workspace;
const St = imports.gi.St;
const Markers = Me.imports.markers;


// TODO:
// - garbage collect closed windows
// - scale factor

let windows = {};
let number = 0;


function generateRandomColor() {
    return Math.floor((Math.random() * 255) + 1);
}

function generateRGBA() {
    return `rgba(${generateRandomColor()}, ${generateRandomColor()}, ${generateRandomColor()}, 0.7)`;
}

function pickRandomMarker(markers) {
    const index = Math.floor(Math.random() * markers.length);
    return markers[index];
}

class DistinctOverlay extends Workspace.WindowOverlay {
    constructor(windowClone, parentActor) {
        super(windowClone, parentActor);

        let gschema = Gio.SettingsSchemaSource.new_from_directory(
            Me.dir.get_child('schemas').get_path(),
            Gio.SettingsSchemaSource.get_default(),
            false
        );

        this.settings = new Gio.Settings({
            settings_schema: gschema.lookup('org.gnome.shell.extensions.distinct', true)
        });
        const meta = this._windowClone.metaWindow;
        const windowName = this._windowClone.metaWindow.toString();
      
        if (windowName in windows) {
            const { uniqueName, color } = windows[windowName];
        } else {
            number += 1;
            let setting = this.settings.get_value('marker-choice');
            let marker = Markers[setting.unpack()];
            windows[windowName] = { uniqueSymbol: pickRandomMarker(marker), color: generateRGBA() };
        }

        this._marker = { number };
        this._marker.box = new St.Bin();


        const { uniqueSymbol, color } = windows[windowName];
        this._marker.box.style = `background-color: ${color};
                                  border-radius: 0 0 10px 0;
                                  padding: 2px;
                                  text-align: center;`;
        this._marker.box.height = 50;
        this._marker.box.width = 50;


        this._marker.label = new St.Label({
            style_class: 'extension-distinctWindows-label',
            text: `${uniqueSymbol}`
        });
        this._marker.box.add_actor(this._marker.label);

        parentActor.add_actor(this._marker.box);
        parentActor.set_child_below_sibling(this.title, this._marker.box);

        // windowClone.connect("destroy", () => {
        //     if (this._marker && this._marker.box) {
        //         this._marker.box.destroy();
        //     }
        // });
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

    _onDestroy(animate) {
        super._onDestroy(animate);
        const windowActor = this._windowClone.get_label_actor();

        if (this._marker && this._marker.box) {
            this._marker.box.destroy();
            // this._marker.label.destroy();
            if (windowActor) {
                delete windows[windowActor.text];
            }
        }
    }
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