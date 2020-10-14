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
    let prefsWidget = new Gtk.Grid({
        margin: 18,
        column_spacing: 12,
        row_spacing: 12,
        visible: true
    });

    // Add a simple title and add it to the prefsWidget
    let title = new Gtk.Label({
        // As described in "Extension Translations", the following template
        // lit
        // prefs.js:88: warning: RegExp literal terminated too early
        //label: `<b>${Me.metadata.name} Extension Preferences</b>`,
        label: '<b>' + Me.metadata.name + ' Extension Preferences</b>',
        halign: Gtk.Align.START,
        use_markup: true,
        visible: true
    });
    prefsWidget.attach(title, 0, 0, 2, 1);

    let choiceLabel = new Gtk.Label({
        label: 'Visual indicator:',
        halign: Gtk.Align.START,
        visible: true
    });
    prefsWidget.attach(choiceLabel, 0, 1, 1, 1);

    // Create a 'Reset' button and add it to the prefsWidget
    let button = new Gtk.Button({
        label: 'Reset Panel',
        visible: true
    });
    prefsWidget.attach(button, 1, 1, 1, 1);

    // Connect the ::clicked signal to reset the stored settings
    button.connect('clicked', (button) => this.settings.reset('panel-states'));

    // Return our widget which will be added to the window
    return prefsWidget;
}