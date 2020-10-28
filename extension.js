/*jshint esversion: 6 */
'use strict';

let on_window_created;

const ExtensionUtils = imports.misc.extensionUtils;
const Gio = imports.gi.Gio;
const Me = ExtensionUtils.getCurrentExtension();
const Workspace = imports.ui.workspace;
const St = imports.gi.St;
const Shell = imports.gi.Shell;
const Markers = Me.imports.markers;


let windowConfigs;
let originalOverlay;
let settings;
let wmHandler;
let settingsHandler;

function resetWindowMarkers() {
    // Replace markers in all existing windowConfigs
    log("Reseting all markers");
    for (const windowName in windowConfigs) {
        setMarker(windowName);
    }
}

function setMarker(windowName) {
    // Persist marker and color for given window
    let setting = settings.get_value('marker-choice');
    let marker = Markers[setting.unpack()];
    windowConfigs[windowName] = { uniqueSymbol: pickRandomMarker(marker), color: generateRGBA() };
}

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

function enable() {
    log(`Enabling ${Me.metadata.name} version ${Me.metadata.version}`);

    windowConfigs = {};

    let wm = global.window_manager;
    wmHandler = wm.connect('destroy', function(_shellwm, actor) {
        // Remove configs for windows that has been closed
        let metaName = actor.meta_window.toString();
        delete windowConfigs[metaName];
    });

    // When user changed preferred markers in settings, reset all markers
    settingsHandler = settings.connect('changed::marker-choice', function() {
        resetWindowMarkers();
    });

    Workspace.WindowOverlay = class extends Workspace.WindowOverlay {
        constructor(windowClone, parentActor) {
            super(windowClone, parentActor);

            const meta = this._windowClone.metaWindow;
            const windowName = meta.toString();

            if (windowName in windowConfigs) {
                const { uniqueName, color } = windowConfigs[windowName];
            } else {
                setMarker(windowName);
            }

            this._marker = {};
            this._marker.box = new St.Bin();

            const { uniqueSymbol, color } = windowConfigs[windowName];
            this._marker.box.style = `background-color: ${color};
                                      border-radius: 0 0 10px 0;
                                      padding: 2px;
                                      text-align: center;`;
            this._marker.box.height = 60;
            this._marker.box.width = 60;


            this._marker.label = new St.Label({
                style_class: 'extension-distinctWindows-label',
                text: `${uniqueSymbol}`
            });
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

        _onDestroy(animate) {
            super._onDestroy(animate);
            const windowActor = this._windowClone.get_label_actor();

            if (this._marker && this._marker.box) {
                this._marker.box.destroy();
                if (windowActor) {
                    delete windowConfigs[windowActor.text];
                }
            }
        }
    };
}

function init() {
    log(`Initializing ${Me.metadata.name} version ${Me.metadata.version}`);
    originalOverlay = Workspace.WindowOverlay;

    let gschema = Gio.SettingsSchemaSource.new_from_directory(
        Me.dir.get_child('schemas').get_path(),
        Gio.SettingsSchemaSource.get_default(),
        false
    );

    settings = new Gio.Settings({
        settings_schema: gschema.lookup('org.gnome.shell.extensions.distinct', true)
    });
}

function disable() {
    log(`Disabling ${Me.metadata.name} version ${Me.metadata.version}`);
    Workspace.WindowOverlay = originalOverlay;
    windowConfigs = {};
    if (settings && settingsHandler) {
        settings.disconnect(settingsHandler);
    }
    if (wmHandler) {
        let wm = global.window_manager;
        wm.disconnect(wmHandler);
    }
}