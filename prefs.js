/*jshint esversion: 6 */
'use strict';

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();


function init() {}

function buildPrefsWidget() {
    this.settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.distinct');

    let prefsWidget = new Gtk.Box({
        margin: 30,
        spacing: 10,
        halign: Gtk.Align.START,
        visible: true
    });

    let box = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 5,
        halign: Gtk.Align.START,
        visible: true
    });

    let choiceLabel = new Gtk.Label({
        label: '<b>Visual indicator</b>',
        halign: Gtk.Align.START,
        use_markup: true,
        visible: true
    });

    box.add(choiceLabel);

    let modes = {
        'shapes': 'Shapes',
        'emojis': 'Emoji'
    };
    let radio = null;
    let currentRadio = null;
    let currentMode = this.settings.get_string('marker-choice');

    for (const mode in modes) {
        let text = modes[mode];
        radio = new Gtk.RadioButton({
            active: currentMode,
            label: text,
            group: radio,
            visible: true
        });

        if (currentMode === mode) {
            currentRadio = radio;
        }

        box.add(radio);

        radio.connect('toggled', button => {
            if (button.active) {
                this.settings.set_string('marker-choice', mode);
            }
        });
    }

    prefsWidget.add(box);

    if (currentRadio) {
        currentRadio.active = true;
    }

    return prefsWidget;
}