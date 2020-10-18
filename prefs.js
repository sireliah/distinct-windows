/*jshint esversion: 6 */
'use strict';

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();


function init() {
}

function buildPrefsWidget() {

    // Copy the same GSettings code from `extension.js`
    let gschema = Gio.SettingsSchemaSource.new_from_directory(
        Me.dir.get_child('schemas').get_path(),
        Gio.SettingsSchemaSource.get_default(),
        false
    );

    this.settings = new Gio.Settings({
        settings_schema: gschema.lookup('org.gnome.shell.extensions.distinct', true)
    });

    // Create a parent widget that we'll return from this function
    let prefsWidget = new Gtk.Box({
        // margin: 18,
        spacing: 5,
        halign: Gtk.Align.CENTER,
        visible: true
    });

    // Add a simple title and add it to the prefsWidget
    let title = new Gtk.Label({
        // As described in "Extension Translations", the following template
        label: '<b>' + Me.metadata.name + ' Extension Preferences</b>',
        halign: Gtk.Align.START,
        use_markup: true,
        visible: true
    });
    prefsWidget.add(title);

    let box = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        halign: Gtk.Align.CENTER,
        visible: true
    });

    let choiceLabel = new Gtk.Label({
        label: 'Visual indicator:',
        // halign: Gtk.Align.START,
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

    //prefsWidget.show_all();
    // Return our widget which will be added to the window
    return prefsWidget;
}